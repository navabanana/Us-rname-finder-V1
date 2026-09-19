"""
Discord 3-4 Letter Username Checker & Generator (Python + CustomTkinter)
Compile en un seul fichier .EXE autonome avec:
    pip install -r requirements.txt
    pyinstaller --onefile --noconsole --name "Discord_3-4L_Checker" discord_checker.py
"""

import sys
import os
import time
import json
import random
import string
import threading
import queue
from datetime import datetime

# Windows sound notification
try:
    import winsound
    def notify_found():
        winsound.Beep(1200, 180)
        time.sleep(0.05)
        winsound.Beep(1600, 220)
except Exception:
    def notify_found():
        pass

# Requests for HTTP Discord API
try:
    import requests
except ImportError:
    print("Erreur: Le module 'requests' n'est pas installe. Tapez: pip install requests")
    sys.exit(1)

# GUI Framework: CustomTkinter with standard Tkinter fallback
try:
    import customtkinter as ctk
    USE_CTK = True
    ctk.set_appearance_mode("Dark")
    ctk.set_default_color_theme("blue")
except ImportError:
    USE_CTK = False
    import tkinter as tk
    from tkinter import ttk, messagebox, filedialog


# -------------------------------------------------------------
# DISCORD API CHECKER ENGINE
# -------------------------------------------------------------
class DiscordCheckerEngine:
    API_URL_UNAUTH = "https://discord.com/api/v9/unique-username/username-attempt-unauthed"
    API_URL_AUTH = "https://discord.com/api/v9/users/@me/pomelo-attempt"

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Origin": "https://discord.com",
            "Referer": "https://discord.com/register",
        })

    def check_username(self, username: str, token: str = ""):
        username = username.strip().lower()
        if len(username) < 2 or len(username) > 32:
            return {"status": "invalid", "message": "Longueur invalide (2-32 car.)"}

        payload = {"username": username}
        headers = {}
        url = self.API_URL_UNAUTH

        if token.strip():
            url = self.API_URL_AUTH
            headers["Authorization"] = token.strip()

        try:
            resp = self.session.post(url, json=payload, headers=headers, timeout=6)

            if resp.status_code == 200:
                data = resp.json()
                taken = data.get("taken", True)
                if not taken:
                    return {"status": "available", "username": username, "message": "DISPONIBLE !"}
                else:
                    return {"status": "taken", "username": username, "message": "Déjà pris"}

            elif resp.status_code == 429:
                try:
                    retry = resp.json().get("retry_after", 3.0)
                except Exception:
                    retry = 3.0
                return {"status": "ratelimit", "retry_after": float(retry), "message": f"Rate limit ({retry}s)"}

            elif resp.status_code == 400:
                data = resp.json()
                msg = data.get("message", "Nom invalide")
                return {"status": "invalid", "username": username, "message": f"Non permis ({msg})"}

            else:
                return {"status": "error", "message": f"HTTP {resp.status_code}"}

        except requests.exceptions.Timeout:
            return {"status": "error", "message": "Délai d'attente dépassé"}
        except requests.exceptions.RequestException as e:
            return {"status": "error", "message": "Erreur réseau"}


# -------------------------------------------------------------
# USERNAME GENERATOR PATTERNS
# -------------------------------------------------------------
VOWELS = "aeiouy"
CONSONANTS = "bcdfghjklmnpqrstvwxz"
LETTERS = string.ascii_lowercase
DIGITS = string.digits

def generate_candidate(length_mode="3", pattern_mode="alpha"):
    if length_mode == "3":
        length = 3
    elif length_mode == "4":
        length = 4
    else:
        length = random.choice([3, 4])

    if pattern_mode == "pronounceable":
        # CVC or CVCV or VCV
        res = []
        is_vowel = random.choice([True, False])
        for _ in range(length):
            if is_vowel:
                res.append(random.choice(VOWELS))
            else:
                res.append(random.choice(CONSONANTS))
            is_vowel = not is_vowel
        return "".join(res)

    elif pattern_mode == "repeating":
        # e.g. xox, abba, xyyx
        if length == 3:
            a, b = random.choice(LETTERS), random.choice(LETTERS)
            return a + b + a
        else:
            a, b = random.choice(LETTERS), random.choice(LETTERS)
            return a + b + b + a

    elif pattern_mode == "alphanumeric":
        chars = LETTERS + DIGITS
        return "".join(random.choices(chars, k=length))

    else:
        # pure letters
        return "".join(random.choices(LETTERS, k=length))


# -------------------------------------------------------------
# MODERN CUSTOMTKINTER GUI
# -------------------------------------------------------------
if USE_CTK:
    class DiscordCheckerApp(ctk.CTk):
        def __init__(self):
            super().__init__()

            self.title("Discord 3-4L Username Checker (Python Natif)")
            self.geometry("980x680")
            self.minsize(860, 580)

            # Palette Discord
            self.COLOR_BG = "#1e1f22"
            self.COLOR_SIDEBAR = "#141517"
            self.COLOR_CARD = "#2b2d31"
            self.COLOR_BLURPLE = "#5865f2"
            self.COLOR_GREEN = "#57f287"
            self.COLOR_RED = "#ed4245"
            self.COLOR_YELLOW = "#fee75c"

            self.configure(fg_color=self.COLOR_BG)

            self.engine = DiscordCheckerEngine()
            self.is_running = False
            self.worker_thread = None
            self.result_queue = queue.Queue()

            self.checked_count = 0
            self.available_count = 0
            self.taken_count = 0
            self.ratelimit_count = 0
            self.available_list = []
            self.seen_usernames = set()

            self._build_ui()
            self.after(60, self._process_queue)

        def _build_ui(self):
            # Header Bar
            header = ctk.CTkFrame(self, fg_color=self.COLOR_SIDEBAR, height=54, corner_radius=0)
            header.pack(fill="x", side="top")

            title_box = ctk.CTkLabel(
                header,
                text="  DISCORD 3-4 LETTERS CHECKER",
                font=ctk.CTkFont(family="Segoe UI", size=17, weight="bold"),
                text_color="#ffffff",
            )
            title_box.pack(side="left", padx=20, pady=12)

            self.status_pill = ctk.CTkLabel(
                header,
                text="ARRÊTÉ",
                fg_color="#36393e",
                text_color="#a3a6aa",
                corner_radius=12,
                font=ctk.CTkFont(size=11, weight="bold"),
                width=80,
                height=24,
            )
            self.status_pill.pack(side="right", padx=20, pady=15)

            # Main Layout
            main_container = ctk.CTkFrame(self, fg_color="transparent")
            main_container.pack(fill="both", expand=True, padx=16, pady=14)

            # Left Column (Controls & Settings)
            left_col = ctk.CTkFrame(main_container, fg_color=self.COLOR_CARD, corner_radius=12, width=320)
            left_col.pack(side="left", fill="y", padx=(0, 12))
            left_col.pack_propagate(False)

            self._build_sidebar(left_col)

            # Right Column (Live Feed, Stats, Tables)
            right_col = ctk.CTkFrame(main_container, fg_color="transparent")
            right_col.pack(side="right", fill="both", expand=True)

            self._build_stats_panel(right_col)
            self._build_feed_panel(right_col)

        def _build_sidebar(self, parent):
            pad_x = 16

            lbl = ctk.CTkLabel(
                parent,
                text="CONFIGURATION",
                font=ctk.CTkFont(size=12, weight="bold"),
                text_color="#858ef8",
            )
            lbl.pack(anchor="w", padx=pad_x, pady=(16, 8))

            # Length Mode
            ctk.CTkLabel(parent, text="Longueur du pseudo :", font=ctk.CTkFont(size=12)).pack(anchor="w", padx=pad_x, pady=(4, 2))
            self.var_length = ctk.StringVar(value="3")
            seg_len = ctk.CTkSegmentedButton(
                parent,
                values=["3 Lettres", "4 Lettres", "Mix 3 & 4"],
                variable=self.var_length,
                selected_color=self.COLOR_BLURPLE,
                selected_hover_color="#4752c4",
            )
            seg_len.pack(fill="x", padx=pad_x, pady=(0, 10))

            # Pattern Mode
            ctk.CTkLabel(parent, text="Modèle de génération :", font=ctk.CTkFont(size=12)).pack(anchor="w", padx=pad_x, pady=(4, 2))
            self.var_pattern = ctk.StringVar(value="Prononçable (CVC/CVCV)")
            combo_pattern = ctk.CTkComboBox(
                parent,
                values=["Prononçable (CVC/CVCV)", "Lettres pures (a-z)", "Symétrique (xox, abba)", "Alphanumérique (a-z, 0-9)"],
                variable=self.var_pattern,
                state="readonly",
                button_color=self.COLOR_BLURPLE,
                dropdown_fg_color=self.COLOR_CARD,
            )
            combo_pattern.pack(fill="x", padx=pad_x, pady=(0, 10))

            # Speed Delay
            ctk.CTkLabel(parent, text="Délai entre requêtes :", font=ctk.CTkFont(size=12)).pack(anchor="w", padx=pad_x, pady=(4, 2))
            self.slider_delay = ctk.CTkSlider(
                parent,
                from_=0.3,
                to=3.0,
                number_of_steps=27,
                button_color=self.COLOR_BLURPLE,
                progress_color=self.COLOR_BLURPLE,
                command=self._on_slider_change,
            )
            self.slider_delay.set(0.9)
            self.slider_delay.pack(fill="x", padx=pad_x, pady=(0, 2))

            self.lbl_delay_val = ctk.CTkLabel(
                parent,
                text="0.9 s  (Sécurité anti-rate limit)",
                font=ctk.CTkFont(size=11),
                text_color="#949ba4",
            )
            self.lbl_delay_val.pack(anchor="w", padx=pad_x, pady=(0, 12))

            # Sound Alert Checkbox
            self.var_sound = ctk.BooleanVar(value=True)
            chk_sound = ctk.CTkCheckBox(
                parent,
                text="Bip sonore si disponible",
                variable=self.var_sound,
                checkbox_height=18,
                checkbox_width=18,
                fg_color=self.COLOR_GREEN,
                hover_color="#43b581",
            )
            chk_sound.pack(anchor="w", padx=pad_x, pady=(0, 12))

            # Optional Token Input
            ctk.CTkLabel(parent, text="Token Discord (optionnel) :", font=ctk.CTkFont(size=11), text_color="#949ba4").pack(anchor="w", padx=pad_x, pady=(2, 2))
            self.entry_token = ctk.CTkEntry(
                parent,
                placeholder_text="Laisser vide pour mode public",
                show="•",
                height=30,
                font=ctk.CTkFont(size=11),
            )
            self.entry_token.pack(fill="x", padx=pad_x, pady=(0, 16))

            # Start / Stop Buttons
            self.btn_toggle = ctk.CTkButton(
                parent,
                text="DÉMARRER LA RECHERCHE",
                font=ctk.CTkFont(weight="bold", size=13),
                fg_color=self.COLOR_BLURPLE,
                hover_color="#4752c4",
                height=42,
                command=self.toggle_scanner,
            )
            self.btn_toggle.pack(fill="x", padx=pad_x, pady=(0, 8))

            # Manual Check Entry
            ctk.CTkLabel(parent, text="Vérification manuelle directe :", font=ctk.CTkFont(size=11), text_color="#949ba4").pack(anchor="w", padx=pad_x, pady=(10, 2))
            manual_frame = ctk.CTkFrame(parent, fg_color="transparent")
            manual_frame.pack(fill="x", padx=pad_x, pady=(0, 8))

            self.entry_manual = ctk.CTkEntry(manual_frame, placeholder_text="ex: neo, void...", height=32)
            self.entry_manual.pack(side="left", fill="x", expand=True, padx=(0, 6))

            btn_manual = ctk.CTkButton(
                manual_frame,
                text="Tester",
                width=65,
                height=32,
                fg_color="#3c404b",
                hover_color="#4e5360",
                command=self.check_single_manual,
            )
            btn_manual.pack(side="right")

            # Export Button
            self.btn_export = ctk.CTkButton(
                parent,
                text="Exporter les trouvés (.txt)",
                fg_color="#2b4238",
                hover_color="#36574a",
                text_color=self.COLOR_GREEN,
                height=32,
                command=self.export_results,
            )
            self.btn_export.pack(fill="x", padx=pad_x, side="bottom", pady=16)

        def _build_stats_panel(self, parent):
            stats_box = ctk.CTkFrame(parent, fg_color=self.COLOR_CARD, corner_radius=12, height=80)
            stats_box.pack(fill="x", pady=(0, 12))
            stats_box.pack_propagate(False)

            grid = ctk.CTkFrame(stats_box, fg_color="transparent")
            grid.pack(expand=True, fill="both", padx=16, pady=8)

            # 4 Columns of stats
            self.lbl_stat_checked = self._create_stat_card(grid, 0, "Testés", "0", "#ffffff")
            self.lbl_stat_avail = self._create_stat_card(grid, 1, "Disponibles", "0", self.COLOR_GREEN)
            self.lbl_stat_taken = self._create_stat_card(grid, 2, "Pris", "0", self.COLOR_RED)
            self.lbl_stat_rates = self._create_stat_card(grid, 3, "Rate Limits", "0", self.COLOR_YELLOW)

        def _create_stat_card(self, parent, col, title, value, color):
            frame = ctk.CTkFrame(parent, fg_color="transparent")
            frame.grid(row=0, column=col, sticky="nsew", padx=8)
            parent.grid_columnconfigure(col, weight=1)

            t = ctk.CTkLabel(frame, text=title, font=ctk.CTkFont(size=11), text_color="#949ba4")
            t.pack(anchor="center")

            v = ctk.CTkLabel(frame, text=value, font=ctk.CTkFont(size=19, weight="bold"), text_color=color)
            v.pack(anchor="center")
            return v

        def _build_feed_panel(self, parent):
            feed_container = ctk.CTkFrame(parent, fg_color=self.COLOR_CARD, corner_radius=12)
            feed_container.pack(fill="both", expand=True)

            feed_header = ctk.CTkFrame(feed_container, fg_color="transparent", height=36)
            feed_header.pack(fill="x", padx=16, pady=(10, 4))

            ctk.CTkLabel(
                feed_header,
                text="JOURNAL DES VÉRIFICATIONS EN DIRECT",
                font=ctk.CTkFont(size=12, weight="bold"),
                text_color="#858ef8",
            ).pack(side="left")

            btn_clear = ctk.CTkButton(
                feed_header,
                text="Effacer",
                width=60,
                height=24,
                fg_color="#36393e",
                hover_color="#4e5360",
                font=ctk.CTkFont(size=11),
                command=self.clear_logs,
            )
            btn_clear.pack(side="right")

            # Scrollable Log Box
            self.log_box = ctk.CTkTextbox(
                feed_container,
                fg_color="#1e1f22",
                text_color="#dbdee1",
                font=ctk.CTkFont(family="Consolas", size=12),
                corner_radius=8,
            )
            self.log_box.pack(fill="both", expand=True, padx=12, pady=(0, 12))

            # Configure tags
            self.log_box.tag_config("avail", foreground=self.COLOR_GREEN)
            self.log_box.tag_config("taken", foreground="#ed4245")
            self.log_box.tag_config("rate", foreground=self.COLOR_YELLOW)
            self.log_box.tag_config("info", foreground="#858ef8")

            self.log_box.insert("end", "Prêt. Choisissez vos paramètres à gauche et cliquez sur Démarrer.\n", "info")

        def _on_slider_change(self, val):
            self.lbl_delay_val.configure(text=f"{val:.1f} s  (Vitesse de test)")

        def toggle_scanner(self):
            if not self.is_running:
                self.is_running = True
                self.btn_toggle.configure(text="ARRÊTER LA RECHERCHE", fg_color=self.COLOR_RED, hover_color="#c03537")
                self.status_pill.configure(text="ACTIF", fg_color=self.COLOR_GREEN, text_color="#121316")

                # Parse settings
                len_choice = self.var_length.get()
                if "3" in len_choice and "4" not in len_choice:
                    l_mode = "3"
                elif "4" in len_choice and "3" not in len_choice:
                    l_mode = "4"
                else:
                    l_mode = "both"

                pat_choice = self.var_pattern.get()
                if "Prononçable" in pat_choice:
                    p_mode = "pronounceable"
                elif "Symétrique" in pat_choice:
                    p_mode = "repeating"
                elif "Alphanumérique" in pat_choice:
                    p_mode = "alphanumeric"
                else:
                    p_mode = "alpha"

                delay = float(self.slider_delay.get())
                token = self.entry_token.get().strip()

                self.worker_thread = threading.Thread(
                    target=self._worker_loop,
                    args=(l_mode, p_mode, delay, token),
                    daemon=True,
                )
                self.worker_thread.start()
            else:
                self.is_running = False
                self.btn_toggle.configure(text="DÉMARRER LA RECHERCHE", fg_color=self.COLOR_BLURPLE, hover_color="#4752c4")
                self.status_pill.configure(text="ARRÊTÉ", fg_color="#36393e", text_color="#a3a6aa")

        def _worker_loop(self, l_mode, p_mode, delay, token):
            consecutive_limits = 0
            while self.is_running:
                candidate = generate_candidate(l_mode, p_mode)
                if candidate in self.seen_usernames:
                    continue

                self.seen_usernames.add(candidate)
                res = self.engine.check_username(candidate, token)

                self.result_queue.put((candidate, res))

                # Handle Rate Limit delay with ethical adaptive backoff
                if res.get("status") == "ratelimit":
                    consecutive_limits += 1
                    base_wait = float(res.get("retry_after", 4.0))
                    # Recul adaptatif éthique pour protéger la connexion IP
                    backoff = min(2.5, 1.25 ** (consecutive_limits - 1))
                    wait_time = round(base_wait * backoff, 1) + 0.8
                    time.sleep(wait_time)
                else:
                    if consecutive_limits > 0:
                        consecutive_limits = max(0, consecutive_limits - 1)
                    # Respect du rythme éthique avec plancher de sécurité
                    safe_delay = max(0.8, delay)
                    time.sleep(safe_delay)

        def _process_queue(self):
            try:
                while True:
                    candidate, res = self.result_queue.get_nowait()
                    self._handle_result(candidate, res)
            except queue.Empty:
                pass
            finally:
                self.after(50, self._process_queue)

        def _handle_result(self, username, res):
            self.checked_count += 1
            self.lbl_stat_checked.configure(text=str(self.checked_count))
            now = datetime.now().strftime("%H:%M:%S")

            status = res.get("status")
            if status == "available":
                self.available_count += 1
                self.lbl_stat_avail.configure(text=str(self.available_count))
                self.available_list.append(username)

                msg = f"[{now}] DISPONIBLE : @{username}  <-- PEUT ÊTRE PRIS !\n"
                self.log_box.insert("end", msg, "avail")
                self.log_box.see("end")

                if self.var_sound.get():
                    threading.Thread(target=notify_found, daemon=True).start()

            elif status == "taken":
                self.taken_count += 1
                self.lbl_stat_taken.configure(text=str(self.taken_count))
                msg = f"[{now}] Pris : @{username}\n"
                self.log_box.insert("end", msg, "taken")
                self.log_box.see("end")

            elif status == "ratelimit":
                self.ratelimit_count += 1
                self.lbl_stat_rates.configure(text=str(self.ratelimit_count))
                wait = res.get("retry_after", 3.0)
                msg = f"[{now}] Rate Limit Discord : pause automatique de {wait}s...\n"
                self.log_box.insert("end", msg, "rate")
                self.log_box.see("end")

            else:
                info = res.get("message", "Erreur")
                msg = f"[{now}] @{username} : {info}\n"
                self.log_box.insert("end", msg, "info")
                self.log_box.see("end")

        def check_single_manual(self):
            user = self.entry_manual.get().strip().lower()
            if not user:
                return

            token = self.entry_token.get().strip()

            def run_single():
                res = self.engine.check_username(user, token)
                self.result_queue.put((user, res))

            threading.Thread(target=run_single, daemon=True).start()

        def export_results(self):
            if not self.available_list:
                self.log_box.insert("end", "[Export] Aucun pseudo disponible à sauvegarder pour le moment.\n", "info")
                return

            filename = f"discord_available_usernames_{int(time.time())}.txt"
            try:
                with open(filename, "w", encoding="utf-8") as f:
                    f.write("# Discord 3-4L Available Usernames\n")
                    f.write(f"# Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                    for name in self.available_list:
                        f.write(f"{name}\n")

                self.log_box.insert("end", f"[Export] Succès : {len(self.available_list)} pseudos enregistrés dans {filename}\n", "avail")
            except Exception as e:
                self.log_box.insert("end", f"[Export] Erreur lors de l'enregistrement : {e}\n", "taken")

        def clear_logs(self):
            self.log_box.delete("1.0", "end")

else:
    # Standard Tkinter Fallback if CustomTkinter is not installed
    class DiscordCheckerApp(tk.Tk):
        def __init__(self):
            super().__init__()
            self.title("Discord 3-4L Username Checker (Tkinter Fallback)")
            self.geometry("800x550")
            lbl = tk.Label(self, text="Pour la version moderne sombre, tapez:\npip install customtkinter", font=("Arial", 14), pady=40)
            lbl.pack()


# -------------------------------------------------------------
# ENTRY POINT
# -------------------------------------------------------------
if __name__ == "__main__":
    app = DiscordCheckerApp()
    app.mainloop()
