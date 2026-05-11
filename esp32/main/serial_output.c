#include "serial_output.h"
#include "driver/uart.h"
#include <string.h>
#define UART_NUM   UART_NUM_0
#define BUF_SIZE   (4096)
void serial_output_init(uint32_t baudrate) {
    uart_config_t cfg = {
        .baud_rate  = baudrate,
        .data_bits  = UART_DATA_8_BITS,
        .parity     = UART_PARITY_DISABLE,
        .stop_bits  = UART_STOP_BITS_1,
        .flow_ctrl  = UART_HW_FLOWCTRL_DISABLE,
    };
    uart_param_config(UART_NUM, &cfg);
    uart_driver_install(UART_NUM, BUF_SIZE * 2, BUF_SIZE * 2, 0, NULL, 0);
}
void serial_send(const char *data) {
    uart_write_bytes(UART_NUM, data, strlen(data));
}