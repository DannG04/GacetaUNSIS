# Copia un archivo al portapapeles de X11 y lo mantiene 10 minutos (para pegar en el editor de Lambda).
import sys, gi
gi.require_version('Gtk', '3.0')
from gi.repository import Gtk, Gdk, GLib
cb = Gtk.Clipboard.get(Gdk.SELECTION_CLIPBOARD)
cb.set_text(open(sys.argv[1], encoding='utf-8').read(), -1)
cb.store()
GLib.timeout_add_seconds(600, Gtk.main_quit)
Gtk.main()
