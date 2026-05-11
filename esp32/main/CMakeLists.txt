idf_component_register(
    SRCS
        "main.c"
        "csi_handler.c"
        "channel_hopper.c"
        "router_registry.c"
        "serial_output.c"
    INCLUDE_DIRS "."
    REQUIRES
        esp_wifi
        esp_event
        nvs_flash
        esp_timer
        driver
        freertos
)