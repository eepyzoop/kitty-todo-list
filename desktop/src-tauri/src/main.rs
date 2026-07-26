// This file was intentionally kept to Tauri's default scaffold (see context.md: "No custom Rust").
// The window is fully configured in tauri.conf.json — it just loads the deployed web URL.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running TaskKitty");
}
