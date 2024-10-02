# BetaCrew Mock Exchange Client

## Project Overview

This project is a client-server application designed to simulate interaction with the **BetaCrew mock exchange server**. The client connects to the server, requests stock order data, handles missing sequences by requesting specific packets, and saves the received data into a JSON file.

The application serves as a basic example of a TCP connection where the client fetches a series of order packets from the server, processes them, and stores the data in an organized format.

## Features

- **Stream All Packets**: The client sends a request to the server to receive all available order packets.
- **Resend Packet**: If any packet sequences are missing, the client will identify them and request the missing packets.
- **Data Persistence**: The received data is stored in a structured format inside `output.json`, ensuring easy retrieval of stock orders.

## Project Structure

- **`client.js`**:

  - This is the client-side code that handles communication with the server.
  - Sends a request to stream all packets or resend missing packets.
  - Receives and processes the data in binary format and converts it into human-readable form.
  - Saves the data into `output.json`.

- **`main.js`**:

  - This is the server-side code that simulates the BetaCrew mock exchange server.
  - It listens for incoming connections on port 3000 and sends order packets to the client.
  - For testing purposes, it may skip some sequence numbers intentionally, so the client can handle missing sequences.

- **`output.json`**:
  - The JSON file where the client saves the received data from the server.
  - Each entry includes the following fields: `symbol`, `buySellIndicator`, `quantity`, `price`, and `sequence`.

## How the Client-Server Interaction Works

1. **Client Request for All Packets**:

   - The client connects to the server and sends a request (Call Type 1) to stream all available packets.
   - The server responds by sending all packets in sequence.

2. **Handling Missing Sequences**:

   - After receiving the data, the client checks if any sequence numbers are missing.
   - If any sequence numbers are missing, the client requests those specific packets using Call Type 2 (Resend Packet).
   - The server responds with the missing packets, ensuring that all sequences are received.

3. **Data Storage**:
   - Once all the packets are received and validated (i.e., no missing sequences), the client stores the data into `output.json` in a structured format.

## How to Run the Project

Follow these steps to run the project successfully on your machine:

### 1. Install Node.js

Make sure you have Node.js installed on your system. You can download it from [here](https://nodejs.org/).

### 2. Clone or Download the Project Files

Download the project files, including:

- `client.js`
- `main.js`
- `output.json`
- `README.md`

Ensure they are all in the same directory.

### 3. Run the Server

First, you need to start the server (which simulates the exchange server). To do that, run:


node main.js

### 4. Run the Client
Now, in a separate terminal window, run the client:

bash
node client.js

### 5. View the Output
After running the client, the output data will be saved in `output.json`. You can open this file to view the stock order data in JSON format.

#### Sample Output (`output.json`)
Here’s an example of what your `output.json` might look like:

```json
[
  {
    "symbol": "SYMB",
    "buySellIndicator": "B",
    "quantity": 100,
    "price": 1000,
    "sequence": 1
  },
  {
    "symbol": "SYMB",
    "buySellIndicator": "S",
    "quantity": 101,
    "price": 1100,
    "sequence": 2
  },
  {
    "symbol": "SYMB",
    "buySellIndicator": "B",
    "quantity": 102,
    "price": 1200,
    "sequence": 3
  },
  {
    "symbol": "SYMB",
    "buySellIndicator": "S",
    "quantity": 103,
    "price": 1300,
    "sequence": 4
  },
  {
    "symbol": "SYMB",
    "buySellIndicator": "B",
    "quantity": 104,
    "price": 1400,
    "sequence": 5
  }
]
````
### 6. Error Handling
If any packet sequences are missing:
- The client will detect the missing sequence numbers.
- The client will send a Call Type 2 request to the server to fetch the missing packets.
- The missing packets will be saved in `output.json` once retrieved.


### 7. Stopping the Server
Once you’re done, you can stop the server by pressing `Ctrl + C` in the terminal where it is running.

## Conclusion
This project simulates a simple stock exchange client-server interaction, where the client requests stock order data, handles missing sequences, and stores the result. The README provides an overview, instructions, and sample data to help you run and understand the project.
````
