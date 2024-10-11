fn main() {
    tauri_build::try_build(
        tauri_build::Attributes::new()
            .plugin(
                "chat",
                tauri_build::InlinedPlugin::new()
                    .default_permission(tauri_build::DefaultPermissionRule::AllowAllCommands)
                    .commands(&[
                        "fetch",
                        "add_conversation",
                        "update_conversation",
                        "delete_conversation",
                        "move_conversation",
                        "get_chat_data",
                        "add_folder",
                        "update_folder",
                        "delete_folder",
                        "move_folder",
                        "delete_message",
                        "find_message",
                        "update_message_content",
                        "clear_conversation",
                        "export",
                        "all_conversation_templates",
                        "find_conversation_template",
                        "delete_conversation_template",
                        "update_conversation_template",
                        "add_conversation_template",
                    ]),
            )
            .plugin(
                "temporary-conversation",
                tauri_build::InlinedPlugin::new()
                    .default_permission(tauri_build::DefaultPermissionRule::AllowAllCommands)
                    .commands(&[
                        "init_temporary_conversation",
                        "temporary_fetch",
                        "delete_temporary_message",
                        "separate_window",
                        "get_temporary_conversation",
                        "delete_temporary_conversation",
                        "clear_temporary_conversation",
                        "save_temporary_conversation",
                        "get_temporary_message",
                        "update_temporary_message",
                    ]),
            )
            .plugin(
                "config",
                tauri_build::InlinedPlugin::new()
                    .default_permission(tauri_build::DefaultPermissionRule::AllowAllCommands)
                    .commands(&["get_config", "set_config", "create_setting_window"]),
            ),
    )
    .unwrap();
}
