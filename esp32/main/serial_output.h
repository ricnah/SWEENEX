#pragma once
#include <stdint.h>
void serial_output_init(uint32_t baudrate);
void serial_send(const char *data);