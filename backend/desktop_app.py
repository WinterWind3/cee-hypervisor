import sys
from functools import partial
from dataclasses import dataclass, field
from pathlib import Path
from typing import List

from PyQt5.QtCore import Qt, QUrl
from PyQt5.QtGui import QIcon, QColor
from PyQt5.QtWidgets import (
    QApplication,
    QMainWindow,
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QTableWidget,
    QTableWidgetItem,
    QPushButton,
    QMessageBox,
    QLabel,
    QToolBar,
    QAction,
    QStatusBar,
)
from PyQt5.QtGui import QDesktopServices
from PyQt5.QtWebEngineWidgets import QWebEngineView


@dataclass
class Vm:
    name: str
    status: str
    cpu: str
    ram: str
    disk: str
    os: str


@dataclass
class VmStats:
    started: int = 0
    stopped: int = 0
    restarted: int = 0
    paused: int = 0
    snapshotted: int = 0
    deleted: int = 0

    def total(self) -> int:
        return self.started + self.stopped + self.restarted + self.paused + self.snapshotted + self.deleted


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()

        self.setWindowTitle("CEE Hypervisor Desktop")
        self.resize(1100, 600)

        # Простая тёмная тема в стиле веб-интерфейса
        self.setStyleSheet(
            """
            QMainWindow { background-color: #020617; color: #e5e7eb; }
            QWidget { background-color: #020617; color: #e5e7eb; }
            QTableWidget { background-color: #020617; gridline-color: #1f2937; }
            QHeaderView::section { background-color: #020617; color: #9ca3af; border: 0px; border-bottom: 1px solid #1f2937; }
            QTableWidget::item { selection-background-color: #1e293b; selection-color: #e5e7eb; }
            QLabel { color: #e5e7eb; }
            """
        )

        # VM data и статистика сейчас не используются напрямую,
        # так как мы встраиваем готовый web-интерфейс внутрь PyQt.
        self.vms: List[Vm] = []
        self.stats = VmStats()

        self._build_ui()

    # UI construction
    def _build_ui(self) -> None:
        # Вариант 1: встраиваем готовый web-интерфейс внутрь PyQt-окна
        central = QWidget(self)
        layout = QVBoxLayout(central)

        self.web_view = QWebEngineView(central)

        index_path = (Path(__file__).resolve().parent.parent / "web" / "index.html").as_posix()
        self.web_view.load(QUrl.fromLocalFile(index_path))

        layout.addWidget(self.web_view)
        self.setCentralWidget(central)

    def _update_summary(self) -> None:
        total = len(self.vms)
        running = sum(1 for vm in self.vms if vm.status == "Running")
        text = f"ВМ: {total} • Запущено: {running}"
        self.summary_label.setText(text)

    def _populate_table(self) -> None:
        self.table.setRowCount(len(self.vms))

        for row, vm in enumerate(self.vms):
            index_item = QTableWidgetItem(str(row + 1))
            index_item.setTextAlignment(Qt.AlignCenter)

            item_name = QTableWidgetItem(vm.name)
            item_status = QTableWidgetItem(vm.status)
            item_cpu = QTableWidgetItem(vm.cpu)
            item_ram = QTableWidgetItem(vm.ram)
            item_disk = QTableWidgetItem(vm.disk)
            item_os = QTableWidgetItem(vm.os)

            # Цветной бейдж для статуса
            if vm.status == "Running":
                status_bg = QColor("#064e3b")  # зелёный фон
                status_fg = QColor("#6ee7b7")  # зелёный текст
            elif vm.status == "Paused":
                status_bg = QColor("#78350f")  # жёлто-коричневый фон
                status_fg = QColor("#facc15")  # жёлтый текст
            else:  # Stopped / другое
                status_bg = QColor("#7f1d1d")  # красный фон
                status_fg = QColor("#fecaca")  # розовый текст

            item_status.setBackground(status_bg)
            item_status.setForeground(status_fg)
            item_status.setTextAlignment(Qt.AlignCenter)

            self.table.setItem(row, 0, index_item)
            self.table.setItem(row, 1, item_name)
            self.table.setItem(row, 2, item_status)
            self.table.setItem(row, 3, item_cpu)
            self.table.setItem(row, 4, item_ram)
            self.table.setItem(row, 5, item_disk)
            self.table.setItem(row, 6, item_os)

            actions_widget = QWidget(self.table)
            hlayout = QHBoxLayout(actions_widget)
            hlayout.setContentsMargins(0, 0, 0, 0)
            hlayout.setSpacing(4)

            if vm.status == "Running":
                btn_stop = QPushButton("", actions_widget)
                btn_stop.setFixedSize(26, 26)
                btn_stop.setStyleSheet("background-color:#dc2626; border-radius:4px;")
                btn_stop.setToolTip("Остановить")
                btn_stop.clicked.connect(partial(self.stop_vm, vm.name))
                hlayout.addWidget(btn_stop)

                btn_restart = QPushButton("", actions_widget)
                btn_restart.setFixedSize(26, 26)
                btn_restart.setStyleSheet("background-color:#f97316; border-radius:4px;")
                btn_restart.setToolTip("Перезапуск")
                btn_restart.clicked.connect(partial(self.restart_vm, vm.name))
                hlayout.addWidget(btn_restart)

                btn_pause = QPushButton("", actions_widget)
                btn_pause.setFixedSize(26, 26)
                btn_pause.setStyleSheet("background-color:#eab308; border-radius:4px;")
                btn_pause.setToolTip("Пауза")
                btn_pause.clicked.connect(partial(self.pause_vm, vm.name))
                hlayout.addWidget(btn_pause)
            else:
                btn_start = QPushButton("", actions_widget)
                btn_start.setFixedSize(26, 26)
                btn_start.setStyleSheet("background-color:#16a34a; border-radius:4px;")
                btn_start.setToolTip("Запустить")
                btn_start.clicked.connect(partial(self.start_vm, vm.name))
                hlayout.addWidget(btn_start)

            btn_console = QPushButton("", actions_widget)
            btn_console.setFixedSize(26, 26)
            btn_console.setStyleSheet("background-color:#4b5563; border-radius:4px;")
            btn_console.setToolTip("Консоль")
            btn_console.clicked.connect(partial(self.open_vm_console, vm.name))
            hlayout.addWidget(btn_console)

            btn_settings = QPushButton("", actions_widget)
            btn_settings.setFixedSize(26, 26)
            btn_settings.setStyleSheet("background-color:#2563eb; border-radius:4px;")
            btn_settings.setToolTip("Настройки")
            btn_settings.clicked.connect(partial(self.open_vm_settings, vm.name))
            hlayout.addWidget(btn_settings)

            btn_snapshot = QPushButton("", actions_widget)
            btn_snapshot.setFixedSize(26, 26)
            btn_snapshot.setStyleSheet("background-color:#7c3aed; border-radius:4px;")
            btn_snapshot.setToolTip("Снимок")
            btn_snapshot.clicked.connect(partial(self.create_vm_snapshot, vm.name))
            hlayout.addWidget(btn_snapshot)

            btn_delete = QPushButton("", actions_widget)
            btn_delete.setFixedSize(26, 26)
            btn_delete.setStyleSheet("background-color:#b91c1c; border-radius:4px;")
            btn_delete.setToolTip("Удалить")
            btn_delete.clicked.connect(partial(self.delete_vm, vm.name))
            hlayout.addWidget(btn_delete)

            actions_widget.setLayout(hlayout)
            self.table.setCellWidget(row, 6, actions_widget)

        self._update_summary()

    # Helpers
    def _find_vm(self, name: str) -> Vm | None:
        for vm in self.vms:
            if vm.name == name:
                return vm
        return None

    def _refresh_after_change(self) -> None:
        self._populate_table()

    # Actions
    def start_vm(self, name: str) -> None:
        vm = self._find_vm(name)
        if not vm:
            return
        self.stats.started += 1
        vm.status = "Running"
        QMessageBox.information(self, "Запуск ВМ", f"ВМ '{name}' запущена.")
        self._refresh_after_change()

    def stop_vm(self, name: str) -> None:
        vm = self._find_vm(name)
        if not vm:
            return
        reply = QMessageBox.question(
            self,
            "Остановка ВМ",
            f"Вы уверены, что хотите остановить ВМ '{name}'?",
        )
        if reply == QMessageBox.Yes:
            self.stats.stopped += 1
            vm.status = "Stopped"
            QMessageBox.information(self, "Остановка ВМ", f"ВМ '{name}' остановлена.")
            self._refresh_after_change()

    def restart_vm(self, name: str) -> None:
        vm = self._find_vm(name)
        if not vm:
            return
        reply = QMessageBox.question(
            self,
            "Перезапуск ВМ",
            f"Перезапустить ВМ '{name}'?",
        )
        if reply == QMessageBox.Yes:
            self.stats.restarted += 1
            vm.status = "Running"
            QMessageBox.information(self, "Перезапуск ВМ", f"ВМ '{name}' перезапущена.")
            self._refresh_after_change()

    def pause_vm(self, name: str) -> None:
        vm = self._find_vm(name)
        if not vm:
            return
        self.stats.paused += 1
        vm.status = "Paused"
        QMessageBox.information(self, "Пауза ВМ", f"ВМ '{name}' приостановлена.")
        self._refresh_after_change()

    def open_vm_console(self, name: str) -> None:
        # Открываем локальный путь, как вы планировали: C:/vnc/<vmName>
        path = f"C:/vnc/{name}"
        url = QUrl.fromLocalFile(path)
        opened = QDesktopServices.openUrl(url)
        if not opened:
            QMessageBox.warning(self, "Консоль ВМ", f"Не удалось открыть консоль по пути:\n{path}")

    def open_vm_settings(self, name: str) -> None:
        vm = self._find_vm(name)
        if not vm:
            return
        text = (
            f"Настройки ВМ '{vm.name}':\n\n"
            f"- CPU: {vm.cpu}\n"
            f"- RAM: {vm.ram}\n"
            f"- Диск: {vm.disk}\n"
            f"- ОС: {vm.os}\n"
            f"- Сеть: virbr0\n"
        )
        QMessageBox.information(self, "Настройки ВМ", text)

    def create_vm_snapshot(self, name: str) -> None:
        vm = self._find_vm(name)
        if not vm:
            return
        # Упрощенно: без ввода имени снапшота, просто считаем действие
        self.stats.snapshotted += 1
        QMessageBox.information(
            self,
            "Снимок ВМ",
            f"Снимок для ВМ '{name}' успешно создан (симуляция).",
        )

    def delete_vm(self, name: str) -> None:
        vm = self._find_vm(name)
        if not vm:
            return
        reply = QMessageBox.warning(
            self,
            "Удаление ВМ",
            f"ВНИМАНИЕ! Это действие необратимо. Удалить ВМ '{name}'?",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No,
        )
        if reply == QMessageBox.Yes:
            self.stats.deleted += 1
            self.vms = [v for v in self.vms if v.name != name]
            QMessageBox.information(self, "Удаление ВМ", f"ВМ '{name}' удалена.")
            self._refresh_after_change()

    def show_vm_stats(self) -> None:
        s = self.stats
        text = (
            "Статистика действий с ВМ:\n\n"
            f"Запущено: {s.started}\n"
            f"Остановлено: {s.stopped}\n"
            f"Перезапущено: {s.restarted}\n"
            f"Приостановлено: {s.paused}\n"
            f"Снимков создано: {s.snapshotted}\n"
            f"Удалено: {s.deleted}\n\n"
            f"Всего действий: {s.total()}"
        )
        QMessageBox.information(self, "Статистика ВМ", text)


def main() -> None:
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())


if __name__ == "__main__":
    main()
