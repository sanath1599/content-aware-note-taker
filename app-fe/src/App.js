// App.js
import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Box,
  Grid,
  Container,
  Divider,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { Mic } from '@mui/icons-material';

function App() {
  const [uuid, setUuid] = useState("");
  const [file, setFile] = useState(null);
  const [uploadEnable, setUploadEnable] = useState(true);
  const [uuidCheck, setUuidCheck] = useState("Generate / Enter UUID to upload Context");
  const [message, setMessage] = useState("");
  const [textToSpeak, setTextToSpeak] = useState("");
  const [recognition, setRecognition] = useState(null);

  const generateUuid = () => {
    const newUuid = uuidv4();
    setUuid(newUuid);
    setMessage(`Generated UUID: ${newUuid}`);
    setUploadEnable(false);
    setUuidCheck("Upload Context");
  };

  const handleUuidChange = (event) => {
    setUuid(event.target.value);
    if (event.target.value.length > 10) {
      setUploadEnable(false);
      setUuidCheck("Upload Context");
    } else {
      setUploadEnable(true);
      setUuidCheck("Need a longer UUID ( At least 10 Char )");
    }
    setMessage("");
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    const allowedTypes = [
      "text/plain",
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
      setMessage(`Selected file: ${selectedFile.name}`);

      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("uuid", uuid);

        const response = await fetch("https://api.example.com/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          setMessage("File uploaded successfully.");
        } else {
          setMessage("Failed to upload file.");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        setMessage("Error uploading file.");
      }
    } else {
      setMessage("Invalid file type. Please select a valid document.");
    }
  };

  const handleSpeak = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    const recognitionInstance = new window.webkitSpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;

    recognitionInstance.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setTextToSpeak(transcript);
    };

    recognitionInstance.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognitionInstance.onend = () => {
      console.log("Speech recognition service disconnected");
      setRecognition(null); // Clear recognition instance
    };

    recognitionInstance.start();
    setRecognition(recognitionInstance);
  };

  const handleStop = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: "20px" }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box
            p={3}
            border={1}
            borderColor="grey.300"
            borderRadius="8px"
            bgcolor="grey.50"
          >
            <Typography variant="h5" gutterBottom>
              Configuration Panel
            </Typography>
            <Divider style={{ marginBottom: "16px" }} />

            <Button
              variant="contained"
              color="primary"
              onClick={generateUuid}
              fullWidth
              aria-label="Generate new UUID"
              style={{ marginBottom: "16px" }}
            >
              Generate New UUID
            </Button>

            <TextField
              label="Enter UUID (or generated UUID)"
              variant="outlined"
              fullWidth
              value={uuid}
              onChange={handleUuidChange}
              aria-describedby="uuid-input-description"
              style={{ marginBottom: "16px" }}
            />
            <Typography id="uuid-input-description" variant="body2" color="textSecondary">
              Please enter at least 10 characters for the UUID.
            </Typography>

            <Button
              variant="contained"
              component="label"
              fullWidth
              color="secondary"
              style={{ marginBottom: "16px" }}
              aria-label={uuidCheck}
            >
              {uuidCheck}
              <input
                type="file"
                hidden
                disabled={uploadEnable}
                accept=".txt, .pdf, .ppt, .pptx, .doc, .docx"
                onChange={handleFileChange}
                aria-label="Upload file"
              />
            </Button>

            {message && (
              <Typography color="textSecondary" variant="body1" role="alert">
                {message}
              </Typography>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box
            p={3}
            border={1}
            borderColor="grey.300"
            borderRadius="8px"
            bgcolor="grey.100"
          >
            <Typography variant="h5" gutterBottom>
              Content Aware Note Taker
            </Typography>

            <TextField
              label="Text from Speech"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={textToSpeak}
              onChange={(e) => setTextToSpeak(e.target.value)}
              style={{ marginBottom: "16px" }}
              aria-label="Transcribed text"
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleSpeak}
              startIcon={<Mic />}
              style={{ marginRight: "8px" }}
              aria-label="Start speech recognition"
            >
              Speak
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleStop}
              aria-label="Stop speech recognition"
            >
              Stop
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
