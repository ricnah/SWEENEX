#include "router_registry.h"
#include <string.h>
#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/semphr.h"
static RouterEntry s_routers[MAX_TRACKED_ROUTERS];
static uint32_t    s_count = 0;
static SemaphoreHandle_t s_mutex = NULL;
void router_registry_init(void) {
    memset(s_routers, 0, sizeof(s_routers));
    s_count = 0;
    s_mutex = xSemaphoreCreateMutex();
}
bool router_registry_update(const char *bssid, uint8_t channel, int8_t rssi) {
    if (!s_mutex) return false;
    xSemaphoreTake(s_mutex, portMAX_DELAY);
    for (uint32_t i = 0; i < s_count; i++) {
        if (strcmp(s_routers[i].bssid, bssid) == 0) {
            s_routers[i].last_rssi    = rssi;
            s_routers[i].channel      = channel;
            s_routers[i].packet_count++;
            xSemaphoreGive(s_mutex);
            return false;
        }
    }
    bool added = false;
    if (s_count < MAX_TRACKED_ROUTERS) {
        strncpy(s_routers[s_count].bssid, bssid, BSSID_STR_LEN - 1);
        s_routers[s_count].channel      = channel;
        s_routers[s_count].last_rssi    = rssi;
        s_routers[s_count].packet_count = 1;
        s_count++;
        added = true;
    }
    xSemaphoreGive(s_mutex);
    return added;
}
uint32_t router_registry_count(void) {
    return s_count;
}
void router_registry_get_all(RouterEntry *out, uint32_t *count) {
    xSemaphoreTake(s_mutex, portMAX_DELAY);
    *count = s_count;
    memcpy(out, s_routers, s_count * sizeof(RouterEntry));
    xSemaphoreGive(s_mutex);
}