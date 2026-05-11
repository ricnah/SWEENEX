#include "channel_hopper.h"
#include "esp_wifi.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include <stdint.h>
static const uint8_t CHANNELS[]  = {1, 6, 11, 36};
static const size_t  N_CHANNELS  = sizeof(CHANNELS) / sizeof(CHANNELS[0]);
static const uint32_t DWELL_MS   = 80;
static volatile uint8_t s_current_channel = 0;
static void channel_hop_task(void *arg) {
    uint8_t idx = 0;
    while (1) {
        uint8_t ch = CHANNELS[idx];
        wifi_second_chan_t second =
            (ch <= 13) ? WIFI_SECOND_CHAN_ABOVE : WIFI_SECOND_CHAN_NONE;
        esp_err_t err = esp_wifi_set_channel(ch, second);
        if (err == ESP_OK) {
            s_current_channel = ch;
        }
        vTaskDelay(pdMS_TO_TICKS(DWELL_MS));
        idx = (idx + 1) % N_CHANNELS;
    }
}
void channel_hopper_start(void) {
    xTaskCreate(channel_hop_task, "ch_hopper", 2048, NULL, 5, NULL);
}
uint8_t channel_hopper_current(void) {
    return s_current_channel;
}