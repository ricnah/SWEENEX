#include "csi_handler.h"
#include "serial_output.h"
#include "channel_hopper.h"
#include "router_registry.h"
#include "esp_timer.h"
#include "esp_log.h"
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
static const char *TAG = "CSI";
void csi_callback(void *ctx, wifi_csi_info_t *data) {
    if (!data || data->len == 0) return;
    int8_t  *buf = data->buf;
    int      len = data->len;
    uint8_t *mac = data->mac;
    char mac_str[18];
    snprintf(mac_str, sizeof(mac_str),
             "%02X:%02X:%02X:%02X:%02X:%02X",
             mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
    uint8_t ch  = channel_hopper_current();
    int8_t rssi = data->rx_ctrl.rssi;
    bool is_new = router_registry_update(mac_str, ch, rssi);
    if (is_new) {
        ESP_LOGI(TAG, "New router: %s ch=%u", mac_str, ch);
    }
    int out_len = len * 5 + 200;
    char *out   = (char *)malloc(out_len);
    if (!out) return;
    int offset = 0;
    offset += snprintf(out + offset, out_len - offset,
        "{\"ts\":%llu,\"ch\":%u,\"bssid\":\"%s\",\"rssi\":%d,\"len\":%d,\"buf\":[",
        (unsigned long long)(esp_timer_get_time() / 1000ULL),
        (unsigned)ch,
        mac_str,
        (int)rssi,
        len);
    for (int i = 0; i < len && offset < out_len - 10; i++) {
        offset += snprintf(out + offset, out_len - offset,
                           "%d%s", (int)buf[i], (i < len - 1) ? "," : "");
    }
    offset += snprintf(out + offset, out_len - offset, "]}\n");
    serial_send(out);
    free(out);
}