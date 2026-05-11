#pragma once
#include <stdint.h>
#include <stdbool.h>
#define MAX_TRACKED_ROUTERS 16
#define BSSID_STR_LEN       18
typedef struct {
    char    bssid[BSSID_STR_LEN];
    uint8_t channel;
    int8_t  last_rssi;
    uint32_t packet_count;
} RouterEntry;
void     router_registry_init(void);
bool     router_registry_update(const char *bssid, uint8_t channel, int8_t rssi);
uint32_t router_registry_count(void);
void     router_registry_get_all(RouterEntry *out, uint32_t *count);