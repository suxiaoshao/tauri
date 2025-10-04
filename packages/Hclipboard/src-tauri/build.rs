fn main() {
    tauri_build::try_build(
        tauri_build::Attributes::new().plugin(
            "clipboard",
            tauri_build::InlinedPlugin::new()
                .default_permission(tauri_build::DefaultPermissionRule::AllowAllCommands)
                .commands(&["query_history", "copy_to_clipboard"]),
        ),
    )
    .unwrap();
}
