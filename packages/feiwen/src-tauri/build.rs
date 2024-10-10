fn main() {
    tauri_build::try_build(
        tauri_build::Attributes::new().plugin(
            "store",
            tauri_build::InlinedPlugin::new()
                .default_permission(tauri_build::DefaultPermissionRule::AllowAllCommands)
                .commands(&["fetch", "get_tags"]),
        ),
    )
    .unwrap();
}
