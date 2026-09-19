import sys
import os
import time
import json
import random
import string
import threading
import queue
import webbrowser
from datetime import datetime

try:
    import winsound
    def notify_found():
        winsound.Beep(1350, 160)
        time.sleep(0.04)
        winsound.Beep(1800, 220)
except Exception:
    def notify_found():
        pass

try:
    import requests
except ImportError:
    print("Erreur: pip install requests requis")
    sys.exit(1)

try:
    import customtkinter as ctk
    USE_CTK = True
    ctk.set_appearance_mode("Dark")
    ctk.set_default_color_theme("blue")
except ImportError:
    USE_CTK = False
    import tkinter as tk
    from tkinter import ttk, messagebox, filedialog

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
            return {"status": "invalid", "message": "Longueur invalide (2-32)"}

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
                    return {"status": "available", "username": username, "message": "DISPONIBLE"}
                else:
                    return {"status": "taken", "username": username, "message": "Pris"}

            elif resp.status_code == 429:
                try:
                    retry = resp.json().get("retry_after", 4.0)
                except Exception:
                    retry = 4.0
                return {"status": "ratelimit", "retry_after": float(retry), "message": f"Rate limit ({retry}s)"}

            elif resp.status_code == 400:
                data = resp.json()
                msg = data.get("message", "Invalide")
                return {"status": "invalid", "username": username, "message": f"Non permis ({msg})"}

            else:
                return {"status": "error", "message": f"HTTP {resp.status_code}"}

        except requests.exceptions.Timeout:
            return {"status": "error", "message": "Délai dépassé"}
        except requests.exceptions.RequestException:
            return {"status": "error", "message": "Erreur réseau"}

VOWELS = "aeiouy"
CONSONANTS = "bcdfghjklmnpqrstvwxz"
LETTERS = string.ascii_lowercase
DIGITS = string.digits

def generate_candidate(length_mode="3", pattern_mode="alpha", custom_len=5):
    if length_mode == "3":
        length = 3
    elif length_mode == "4":
        length = 4
    elif length_mode in ("both", "mix", "Mix 3 & 4"):
        length = random.choice([3, 4])
    else:
        try:
            length = max(2, min(32, int(custom_len)))
        except Exception:
            length = 5

    if pattern_mode == "pronounceable":
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
        if length <= 2:
            a = random.choice(LETTERS)
            return a * length
        half = length // 2
        first_half = [random.choice(LETTERS) for _ in range(half)]
        middle = [random.choice(LETTERS)] if length % 2 == 1 else []
        return "".join(first_half + middle + list(reversed(first_half)))

    elif pattern_mode == "alphanumeric":
        first = random.choice(LETTERS)
        chars = LETTERS + DIGITS
        rest = "".join(random.choices(chars, k=length - 1))
        return first + rest

    else:
        return "".join(random.choices(LETTERS, k=length))

if USE_CTK:
    class FinalDiscordApp(ctk.CTk):
        def __init__(self):
            super().__init__()

            self.title("FINAL DISCORD 3-4L HUNTER // VIBE EDITION")
            self.geometry("1040x700")
            self.minsize(900, 600)

            self.COLOR_BG = "#08090d"
            self.COLOR_SIDEBAR = "#0e1017"
            self.COLOR_CARD = "#12141e"
            self.COLOR_CARD_BORDER = "#1e2233"
            self.COLOR_CYAN = "#00f0ff"
            self.COLOR_EMERALD = "#00ff9d"
            self.COLOR_BLURPLE = "#5865f2"
            self.COLOR_PINK = "#ff007f"
            self.COLOR_RED = "#ff3366"
            self.COLOR_AMBER = "#ffb703"

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
            self.latest_available = None
            self.seen_usernames = set()

            self._build_ui()
            self.after(50, self._process_queue)

        def _build_ui(self):
            header = ctk.CTkFrame(self, fg_color=self.COLOR_SIDEBAR, height=60, corner_radius=0)
            header.pack(fill="x", side="top")

            brand_box = ctk.CTkFrame(header, fg_color="transparent")
            brand_box.pack(side="left", padx=24, pady=12)

            logo_lbl = ctk.CTkLabel(
                brand_box,
                text="⚡ FINAL",
                font=ctk.CTkFont(family="Segoe UI", size=18, weight="bold"),
                text_color=self.COLOR_CYAN,
            )
            logo_lbl.pack(side="left", padx=(0, 8))

            subtitle_lbl = ctk.CTkLabel(
                brand_box,
                text="DISCORD 3-4L HUNTER // VIBECODED",
                font=ctk.CTkFont(family="Segoe UI", size=12, weight="bold"),
                text_color="#8c93a8",
            )
            subtitle_lbl.pack(side="left")

            self.status_badge = ctk.CTkLabel(
                header,
                text="○ EN PAUSE",
                fg_color="#181a24",
                text_color="#6c7285",
                corner_radius=14,
                font=ctk.CTkFont(family="Consolas", size=11, weight="bold"),
                width=110,
                height=28,
            )
            self.status_badge.pack(side="right", padx=24, pady=16)

            main_container = ctk.CTkFrame(self, fg_color="transparent")
            main_container.pack(fill="both", expand=True, padx=18, pady=16)

            left_col = ctk.CTkFrame(
                main_container,
                fg_color=self.COLOR_CARD,
                border_color=self.COLOR_CARD_BORDER,
                border_width=1,
                corner_radius=16,
                width=330,
            )
            left_col.pack(side="left", fill="y", padx=(0, 14))
            left_col.pack_propagate(False)

            self._build_sidebar(left_col)

            right_col = ctk.CTkFrame(main_container, fg_color="transparent")
            right_col.pack(side="right", fill="both", expand=True)

            self._build_stats_panel(right_col)
            self._build_feed_panel(right_col)

        def _build_sidebar(self, parent):
            self.pad_x = 18
            pad_x = self.pad_x

            header_pill = ctk.CTkLabel(
                parent,
                text="✦ CONTRÔLES DU SCANNER",
                font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"),
                text_color=self.COLOR_CYAN,
            )
            header_pill.pack(anchor="w", padx=pad_x, pady=(18, 12))

            ctk.CTkLabel(parent, text="Longueur du pseudo", font=ctk.CTkFont(size=11, weight="bold"), text_color="#cbd5e1").pack(anchor="w", padx=pad_x, pady=(2, 4))
            self.var_length = ctk.StringVar(value="3 Lettres")
            self.seg_len = ctk.CTkSegmentedButton(
                parent,
                values=["3 Lettres", "4 Lettres", "Mix 3 & 4", "Sur mesure"],
                variable=self.var_length,
                command=self._on_length_mode_change,
                selected_color=self.COLOR_BLURPLE,
                selected_hover_color="#4752c4",
                unselected_color="#181a26",
                unselected_hover_color="#222536",
                font=ctk.CTkFont(size=10, weight="bold"),
                height=32,
            )
            self.seg_len.pack(fill="x", padx=pad_x, pady=(0, 6))

            self.frame_custom_len = ctk.CTkFrame(parent, fg_color="#141622", border_color=self.COLOR_CARD_BORDER, border_width=1, corner_radius=10)
            self.lbl_custom_len = ctk.CTkLabel(
                self.frame_custom_len,
                text="Taille choisie : 5 caractères",
                font=ctk.CTkFont(family="Consolas", size=10, weight="bold"),
                text_color=self.COLOR_CYAN,
            )
            self.lbl_custom_len.pack(anchor="w", padx=10, pady=(6, 2))
            self.slider_custom_len = ctk.CTkSlider(
                self.frame_custom_len,
                from_=2,
                to=32,
                number_of_steps=30,
                button_color=self.COLOR_CYAN,
                progress_color=self.COLOR_BLURPLE,
                fg_color="#1d2030",
                command=self._on_custom_len_slider,
            )
            self.slider_custom_len.set(5)
            self.slider_custom_len.pack(fill="x", padx=10, pady=(0, 8))

            ctk.CTkLabel(parent, text="Modèle de génération", font=ctk.CTkFont(size=11, weight="bold"), text_color="#cbd5e1").pack(anchor="w", padx=pad_x, pady=(2, 4))
            self.var_pattern = ctk.StringVar(value="Prononçable (CVC/CVCV)")
            combo_pattern = ctk.CTkComboBox(
                parent,
                values=["Prononçable (CVC/CVCV)", "Lettres pures (a-z)", "Symétrique (xox, abba)", "Alphanumérique (a-z, 0-9)"],
                variable=self.var_pattern,
                state="readonly",
                button_color=self.COLOR_BLURPLE,
                dropdown_fg_color="#181a26",
                fg_color="#151722",
                border_color=self.COLOR_CARD_BORDER,
                font=ctk.CTkFont(size=11),
                height=32,
            )
            combo_pattern.pack(fill="x", padx=pad_x, pady=(0, 12))

            ctk.CTkLabel(parent, text="Cadence éthique & sécurité", font=ctk.CTkFont(size=11, weight="bold"), text_color="#cbd5e1").pack(anchor="w", padx=pad_x, pady=(2, 4))
            self.slider_delay = ctk.CTkSlider(
                parent,
                from_=0.8,
                to=3.0,
                number_of_steps=22,
                button_color=self.COLOR_CYAN,
                progress_color=self.COLOR_BLURPLE,
                fg_color="#1a1d2b",
                command=self._on_slider_change,
            )
            self.slider_delay.set(1.2)
            self.slider_delay.pack(fill="x", padx=pad_x, pady=(0, 4))

            self.lbl_delay_val = ctk.CTkLabel(
                parent,
                text="1.2 s  (Cadence recommandée)",
                font=ctk.CTkFont(family="Consolas", size=10),
                text_color=self.COLOR_CYAN,
            )
            self.lbl_delay_val.pack(anchor="w", padx=pad_x, pady=(0, 12))

            self.var_sound = ctk.BooleanVar(value=True)
            chk_sound = ctk.CTkCheckBox(
                parent,
                text="Alerte audio si disponible",
                variable=self.var_sound,
                checkbox_height=18,
                checkbox_width=18,
                fg_color=self.COLOR_EMERALD,
                hover_color="#00cc7e",
                font=ctk.CTkFont(size=11),
            )
            chk_sound.pack(anchor="w", padx=pad_x, pady=(0, 8))

            self.var_auto_equip = ctk.BooleanVar(value=True)
            chk_auto_equip = ctk.CTkCheckBox(
                parent,
                text="⚡ Auto-équiper si libre (Copie & Ouvre)",
                variable=self.var_auto_equip,
                checkbox_height=18,
                checkbox_width=18,
                fg_color=self.COLOR_CYAN,
                hover_color="#00c4d1",
                text_color=self.COLOR_CYAN,
                font=ctk.CTkFont(size=11, weight="bold"),
            )
            chk_auto_equip.pack(anchor="w", padx=pad_x, pady=(0, 12))

            ctk.CTkLabel(parent, text="Jeton Discord (optionnel)", font=ctk.CTkFont(size=11, weight="bold"), text_color="#cbd5e1").pack(anchor="w", padx=pad_x, pady=(2, 4))
            self.entry_token = ctk.CTkEntry(
                parent,
                placeholder_text="Public par défaut...",
                show="•",
                height=32,
                font=ctk.CTkFont(size=11),
                fg_color="#151722",
                border_color=self.COLOR_CARD_BORDER,
            )
            self.entry_token.pack(fill="x", padx=pad_x, pady=(0, 16))

            self.btn_toggle = ctk.CTkButton(
                parent,
                text="⚡ DÉMARRER LE SCANNER",
                font=ctk.CTkFont(family="Segoe UI", weight="bold", size=12),
                fg_color=self.COLOR_BLURPLE,
                hover_color="#4752c4",
                height=44,
                corner_radius=12,
                command=self.toggle_scanner,
            )
            self.btn_toggle.pack(fill="x", padx=pad_x, pady=(0, 12))

            ctk.CTkLabel(parent, text="Vérification unitaire instantanée", font=ctk.CTkFont(size=11, weight="bold"), text_color="#cbd5e1").pack(anchor="w", padx=pad_x, pady=(6, 4))
            manual_frame = ctk.CTkFrame(parent, fg_color="transparent")
            manual_frame.pack(fill="x", padx=pad_x, pady=(0, 14))

            self.entry_manual = ctk.CTkEntry(
                manual_frame,
                placeholder_text="ex: neo, void, 7x7...",
                height=34,
                fg_color="#151722",
                border_color=self.COLOR_CARD_BORDER,
                font=ctk.CTkFont(size=11),
            )
            self.entry_manual.pack(side="left", fill="x", expand=True, padx=(0, 6))

            btn_manual = ctk.CTkButton(
                manual_frame,
                text="Tester",
                width=65,
                height=34,
                fg_color="#222638",
                hover_color="#2f354d",
                text_color=self.COLOR_CYAN,
                font=ctk.CTkFont(size=11, weight="bold"),
                command=self.check_single_manual,
            )
            btn_manual.pack(side="right")

            self.btn_export = ctk.CTkButton(
                parent,
                text="📥 Exporter les Disponibles (.txt)",
                fg_color="#13241c",
                border_color=self.COLOR_EMERALD,
                border_width=1,
                hover_color="#1a3528",
                text_color=self.COLOR_EMERALD,
                font=ctk.CTkFont(size=11, weight="bold"),
                height=36,
                corner_radius=10,
                command=self.export_results,
            )
            self.btn_export.pack(fill="x", padx=pad_x, side="bottom", pady=18)

        def _build_stats_panel(self, parent):
            stats_box = ctk.CTkFrame(
                parent,
                fg_color=self.COLOR_CARD,
                border_color=self.COLOR_CARD_BORDER,
                border_width=1,
                corner_radius=16,
                height=88,
            )
            stats_box.pack(fill="x", pady=(0, 14))
            stats_box.pack_propagate(False)

            grid = ctk.CTkFrame(stats_box, fg_color="transparent")
            grid.pack(expand=True, fill="both", padx=16, pady=8)

            self.lbl_stat_checked = self._create_stat_card(grid, 0, "TESTÉS", "0", self.COLOR_CYAN)
            self.lbl_stat_avail = self._create_stat_card(grid, 1, "DISPONIBLES", "0", self.COLOR_EMERALD)
            self.lbl_stat_taken = self._create_stat_card(grid, 2, "PRIS", "0", self.COLOR_RED)
            self.lbl_stat_rates = self._create_stat_card(grid, 3, "RATE LIMITS", "0", self.COLOR_AMBER)

        def _create_stat_card(self, parent, col, title, value, color):
            frame = ctk.CTkFrame(parent, fg_color="#161824", corner_radius=10)
            frame.grid(row=0, column=col, sticky="nsew", padx=5)
            parent.grid_columnconfigure(col, weight=1)

            t = ctk.CTkLabel(
                frame,
                text=title,
                font=ctk.CTkFont(family="Segoe UI", size=9, weight="bold"),
                text_color="#7b8399",
            )
            t.pack(anchor="center", pady=(6, 0))

            v = ctk.CTkLabel(
                frame,
                text=value,
                font=ctk.CTkFont(family="Consolas", size=22, weight="bold"),
                text_color=color,
            )
            v.pack(anchor="center", pady=(0, 6))
            return v

        def _build_feed_panel(self, parent):
            feed_container = ctk.CTkFrame(
                parent,
                fg_color=self.COLOR_CARD,
                border_color=self.COLOR_CARD_BORDER,
                border_width=1,
                corner_radius=16,
            )
            feed_container.pack(fill="both", expand=True)

            feed_header = ctk.CTkFrame(feed_container, fg_color="transparent", height=40)
            feed_header.pack(fill="x", padx=18, pady=(12, 6))

            ctk.CTkLabel(
                feed_header,
                text="⚡ JOURNAL CYBER EN DIRECT",
                font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"),
                text_color=self.COLOR_CYAN,
            ).pack(side="left")

            btn_clear = ctk.CTkButton(
                feed_header,
                text="Vider",
                width=65,
                height=26,
                fg_color="#1b1e2c",
                hover_color="#272b3f",
                font=ctk.CTkFont(size=10, weight="bold"),
                text_color="#a6adbb",
                command=self.clear_logs,
            )
            btn_clear.pack(side="right")

            self.btn_equip = ctk.CTkButton(
                feed_header,
                text="⚡ Équiper (@aucun)",
                width=165,
                height=26,
                fg_color="#141824",
                border_color="#2b3248",
                border_width=1,
                hover_color="#1d2436",
                font=ctk.CTkFont(size=11, weight="bold"),
                text_color="#7b849b",
                command=self.equip_latest,
            )
            self.btn_equip.pack(side="right", padx=(0, 8))

            self.log_box = ctk.CTkTextbox(
                feed_container,
                fg_color="#0b0c12",
                text_color="#cbd5e1",
                font=ctk.CTkFont(family="Consolas", size=12),
                corner_radius=12,
            )
            self.log_box.pack(fill="both", expand=True, padx=14, pady=(0, 14))

            self.log_box.tag_config("avail", foreground=self.COLOR_EMERALD)
            self.log_box.tag_config("taken", foreground=self.COLOR_RED)
            self.log_box.tag_config("rate", foreground=self.COLOR_AMBER)
            self.log_box.tag_config("info", foreground=self.COLOR_CYAN)
            self.log_box.tag_config("vibe", foreground=self.COLOR_PINK)

            self.log_box.insert("end", "[SYSTEM] Initialisation de l'environnement Vibe Hunter terminée.\n", "info")
            self.log_box.insert("end", "[READY] Configurez les paramètres et cliquez sur DÉMARRER.\n\n", "vibe")

        def _on_slider_change(self, val):
            self.lbl_delay_val.configure(text=f"{val:.1f} s  (Vitesse de test)")

        def _on_length_mode_change(self, val):
            if val == "Sur mesure":
                self.frame_custom_len.pack(fill="x", padx=self.pad_x, pady=(0, 10), after=self.seg_len)
            else:
                self.frame_custom_len.pack_forget()

        def _on_custom_len_slider(self, val):
            self.lbl_custom_len.configure(text=f"Taille choisie : {int(val)} caractères")

        def toggle_scanner(self):
            if not self.is_running:
                self.is_running = True
                self.btn_toggle.configure(text="■ ARRÊTER LE SCANNER", fg_color=self.COLOR_RED, hover_color="#d62252")
                self.status_badge.configure(text="● ACTIF", fg_color="#102e21", text_color=self.COLOR_EMERALD)

                len_choice = self.var_length.get()
                if "3" in len_choice and "4" not in len_choice and "Mix" not in len_choice:
                    l_mode = "3"
                elif "4" in len_choice and "3" not in len_choice and "Mix" not in len_choice:
                    l_mode = "4"
                elif "Mix" in len_choice:
                    l_mode = "both"
                else:
                    l_mode = "custom"

                custom_len = int(self.slider_custom_len.get()) if hasattr(self, "slider_custom_len") else 5

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
                    args=(l_mode, p_mode, delay, token, custom_len),
                    daemon=True,
                )
                self.worker_thread.start()
            else:
                self.is_running = False
                self.btn_toggle.configure(text="⚡ DÉMARRER LE SCANNER", fg_color=self.COLOR_BLURPLE, hover_color="#4752c4")
                self.status_badge.configure(text="○ EN PAUSE", fg_color="#181a24", text_color="#6c7285")

        def _worker_loop(self, l_mode, p_mode, delay, token, custom_len=5):
            consecutive_limits = 0
            while self.is_running:
                candidate = generate_candidate(l_mode, p_mode, custom_len)
                if candidate in self.seen_usernames:
                    continue

                self.seen_usernames.add(candidate)
                res = self.engine.check_username(candidate, token)

                self.result_queue.put((candidate, res))

                if res.get("status") == "ratelimit":
                    consecutive_limits += 1
                    base_wait = float(res.get("retry_after", 4.0))
                    backoff = min(2.5, 1.25 ** (consecutive_limits - 1))
                    wait_time = round(base_wait * backoff, 1) + 0.8
                    time.sleep(wait_time)
                else:
                    if consecutive_limits > 0:
                        consecutive_limits = max(0, consecutive_limits - 1)
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
                self.after(45, self._process_queue)

        def _handle_result(self, username, res):
            self.checked_count += 1
            self.lbl_stat_checked.configure(text=str(self.checked_count))
            now = datetime.now().strftime("%H:%M:%S")

            status = res.get("status")
            if status == "available":
                self.available_count += 1
                self.lbl_stat_avail.configure(text=str(self.available_count))
                self.available_list.append(username)
                self.latest_available = username
                self.btn_equip.configure(
                    text=f"⚡ Équiper (@{username})",
                    fg_color="#102e21",
                    border_color=self.COLOR_EMERALD,
                    text_color=self.COLOR_EMERALD,
                )

                msg = f"[{now}] ⚡ LIBRE DISPONIBLE : @{username}  <-- PEUT ÊTRE ENREGISTRÉ !\n"
                self.log_box.insert("end", msg, "avail")
                self.log_box.see("end")

                if self.var_sound.get():
                    threading.Thread(target=notify_found, daemon=True).start()

                if self.var_auto_equip.get():
                    self.equip_username(username)

            elif status == "taken":
                self.taken_count += 1
                self.lbl_stat_taken.configure(text=str(self.taken_count))
                msg = f"[{now}] ✗ Pris : @{username}\n"
                self.log_box.insert("end", msg, "taken")
                self.log_box.see("end")

            elif status == "ratelimit":
                self.ratelimit_count += 1
                self.lbl_stat_rates.configure(text=str(self.ratelimit_count))
                wait = res.get("retry_after", 4.0)
                msg = f"[{now}] ⏳ Rate Limit Discord : pause automatique de {wait}s...\n"
                self.log_box.insert("end", msg, "rate")
                self.log_box.see("end")

            else:
                info = res.get("message", "Erreur")
                msg = f"[{now}] ✦ @{username} : {info}\n"
                self.log_box.insert("end", msg, "info")
                self.log_box.see("end")

        def equip_username(self, username):
            if not username:
                return
            try:
                self.clipboard_clear()
                self.clipboard_append(username)
                self.update()
            except Exception:
                pass
            try:
                webbrowser.open("https://discord.com/channels/@me")
            except Exception:
                pass
            msg = f"[ACTION ⚡] @{username} copié dans le presse-papier ! Page Discord profil ouverte pour l'enregistrer.\n"
            self.log_box.insert("end", msg, "avail")
            self.log_box.see("end")

        def equip_latest(self):
            if self.latest_available:
                self.equip_username(self.latest_available)
            elif self.available_list:
                self.equip_username(self.available_list[-1])
            else:
                self.log_box.insert("end", "[INFO] Aucun pseudo disponible détecté pour le moment.\n", "info")
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
                self.log_box.insert("end", "[Export] Aucun pseudo libre dans la liste actuelle.\n", "info")
                return

            filename = f"discord_available_{int(time.time())}.txt"
            try:
                with open(filename, "w", encoding="utf-8") as f:
                    f.write("# Discord Available Usernames\n")
                    f.write(f"# Export Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                    for name in self.available_list:
                        f.write(f"{name}\n")

                self.log_box.insert("end", f"[Export] Succès : {len(self.available_list)} pseudos exportés dans {filename}\n", "avail")
            except Exception as e:
                self.log_box.insert("end", f"[Export] Erreur : {e}\n", "taken")

        def clear_logs(self):
            self.log_box.delete("1.0", "end")

else:
    class FinalDiscordApp(tk.Tk):
        def __init__(self):
            super().__init__()
            self.title("FINAL DISCORD CHECKER")
            self.geometry("800x550")
            lbl = tk.Label(self, text="customtkinter requis pour l'interface vibecodée :\npip install customtkinter", font=("Segoe UI", 14), pady=40)
            lbl.pack()

if __name__ == "__main__":
    app = FinalDiscordApp()
    app.mainloop()
