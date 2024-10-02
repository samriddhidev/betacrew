const net = require("net");
const fs = require("fs");

const PORT = 3001; // Port for the server

// Start the TCP server
const server = net.createServer((socket) => {
  console.log("Client connected");

  socket.on("data", (data) => {
    // Handle incoming data from the client
    console.log("Received data from client:", data);

    // Process the request from the client
    const callType = data.readUInt8(0);
    if (callType === 1) {
      // Handle "Stream All Packets" request
      const response = createPacketResponse(); // Generate packets to send back
      socket.write(response);
    } else if (callType === 2) {
      // Handle "Resend Packet" request
      const sequence = data.readUInt8(1);
      const resendResponse = createResendResponse(sequence); // Generate packet based on the sequence
      socket.write(resendResponse);
    }
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err);
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

// Function to create a response packet
function createPacketResponse() {
  const packetCount = 5; // Number of packets to send
  const response = Buffer.alloc(17 * packetCount); // Each packet is 17 bytes

  for (let i = 0; i < packetCount; i++) {
    const offset = i * 17;
    response.write("SYMB", offset); // Symbol (4 bytes)
    response.writeUInt8(
      i % 2 === 0 ? "B".charCodeAt(0) : "S".charCodeAt(0),
      offset + 4
    ); // Buy/Sell indicator (1 byte)
    response.writeInt32BE(100 + i, offset + 5); // Quantity (4 bytes)
    response.writeInt32BE(1000 + i * 100, offset + 9); // Price (4 bytes)
    response.writeInt32BE(i + 1, offset + 13); // Sequence number (4 bytes)
  }
  return response;
}

// Function to create a response for a specific sequence
function createResendResponse(sequence) {
  const response = Buffer.alloc(17);
  const offset = 0;
  response.write("SYMB", offset); // Symbol (4 bytes)
  response.writeUInt8("R".charCodeAt(0), offset + 4); // Resend indicator (1 byte)
  response.writeInt32BE(0, offset + 5); // Quantity (4 bytes)
  response.writeInt32BE(0, offset + 9); // Price (4 bytes)
  response.writeInt32BE(sequence, offset + 13); // Sequence number (4 bytes)
  return response;
}

// Start the server
server.listen(PORT, () => {
  console.log(`TCP server started on port ${PORT}`);
});

// Client code
const createClient = () => {
  const client = new net.Socket();
  let receivedPackets = [];
  let missingSequences = [];
  let clientConnected = false;

  // Connect to the server
  client.connect(PORT, "127.0.0.1", () => {
    clientConnected = true;
    console.log("Connected to server");

    // Request to stream all packets (call type 1)
    const payload = Buffer.alloc(1);
    payload.writeUInt8(1, 0); // Set call type to 1 (Stream All Packets)
    safeWrite(client, payload);
  });

  // Handle incoming data from the server
  client.on("data", (data) => {
    parseData(data);
  });

  // Parse the data received from the server
  const parseData = (data) => {
    let offset = 0;
    while (offset < data.length) {
      const symbol = data.toString("ascii", offset, offset + 4);
      const buySellIndicator = data.toString("ascii", offset + 4, offset + 5);
      const quantity = data.readInt32BE(offset + 5);
      const price = data.readInt32BE(offset + 9);
      const sequence = data.readInt32BE(offset + 13);

      // Store the received packet
      receivedPackets.push({
        symbol,
        buySellIndicator,
        quantity,
        price,
        sequence,
      });

      // Check for missing sequences
      if (receivedPackets.length > 1) {
        const expectedSequence =
          receivedPackets[receivedPackets.length - 2].sequence + 1;
        if (sequence !== expectedSequence) {
          for (let i = expectedSequence; i < sequence; i++) {
            missingSequences.push(i);
          }
        }
      }

      offset += 17; // Move to the next packet
    }

    // Handle missing sequences
    handleMissingSequences();
  };

  // Handle missing sequences after data reception
  const handleMissingSequences = () => {
    if (missingSequences.length === 0) {
      console.log("No missing sequences");
      saveDataToFile();
      client.destroy(); // Close the connection
      return;
    }

    console.log("Missing sequences detected:", missingSequences);

    // Request to resend missing packets
    missingSequences.forEach((seq) => {
      const payload = Buffer.alloc(2);
      payload.writeUInt8(2, 0); // Set call type to 2 (Resend Packet)
      payload.writeUInt8(seq, 1); // Set the missing sequence number
      safeWrite(client, payload);
    });
  };

  // Save received data to a JSON file
  const saveDataToFile = () => {
    receivedPackets.sort((a, b) => a.sequence - b.sequence);
    fs.writeFileSync("output.json", JSON.stringify(receivedPackets, null, 2));
    console.log("Data saved to output.json");
  };

  // Safe write operation to handle potential errors
  const safeWrite = (client, payload) => {
    if (clientConnected) {
      client.write(payload, (err) => {
        if (err) {
          console.error("Write error:", err.message);
        }
      });
    } else {
      console.warn("Cannot write to client: not connected.");
    }
  };

  // Handle errors
  client.on("error", (err) => {
    console.error("Client error:", err.message);
    clientConnected = false;
  });

  // Handle connection close
  client.on("close", () => {
    clientConnected = false;
    console.log("Connection closed");
  });
};

// Start the client
createClient();
