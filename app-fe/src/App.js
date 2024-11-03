import React, { useState, useRef } from "react";
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
import { Mic, PictureAsPdf } from '@mui/icons-material';
import axios from 'axios';

function App() {
  const [uuid, setUuid] = useState("");
  const [file, setFile] = useState(null);
  const [uploadEnable, setUploadEnable] = useState(true);
  const [uuidCheck, setUuidCheck] = useState("Generate / Enter UUID to upload Context");
  const [message, setMessage] = useState("");
  const [textToSpeak, setTextToSpeak] = useState("");
  const [recognition, setRecognition] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;

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
      setUuidCheck("Need a longer UUID (At least 10 Char)");
    }
    setMessage("");
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    const allowedTypes = ["application/pdf"];

    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
      setMessage(`Selected file: ${selectedFile.name}`);

      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("uuid", uuid);
        
        const response = await axios.post(`${API_URL}/api/notes/createContext`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setMessage(response.data.message);
      } catch (error) {
        console.error("Error uploading file:", error);
        setMessage("Error uploading file.");
        if (error?.response?.data?.message) setMessage(error.response.data.message);
      }
    } else {
      setMessage("Invalid file type. Please select a valid document.");
    }
  };

  const accumulatedTranscript = useRef(""); // Accumulated transcript across results
  const delayTimer = useRef(null); // Timer reference for delay

  const handleSpeak = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    const recognitionInstance = new window.webkitSpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;

    recognitionInstance.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      // Update local state to show live text
      setTextToSpeak(transcript);

      // Append the new transcript to the accumulated transcript
      accumulatedTranscript.current = transcript;

      // Clear any existing delay timer
      if (delayTimer.current) clearTimeout(delayTimer.current);

      // Set a new delay timer to send data after 3 seconds of inactivity
      delayTimer.current = setTimeout(() => {
        sendToAPI(accumulatedTranscript.current);
        accumulatedTranscript.current = ""; // Reset after sending
      }, 3000); // Adjust the delay (in milliseconds) as needed
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

  const sendToAPI = async (speechText) => {
    try {
      await axios.post(`${API_URL}/api/notes/recordSpeech`, {
        uuid: uuid,
        transcript: speechText
      });
      console.log("Speech data sent successfully:", speechText);
    } catch (error) {
      console.error("Error sending speech data:", error);
    }
  };

  // Function to generate the PDF from textToSpeak content
  const generatePdf = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/notes/generatePDF`, {
        uuid: uuid,
        // markdownContent: textToSpeak
      }, {
        responseType: 'blob' // Important for handling PDF files
      });

      // Create a URL for the PDF file
      const pdfUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.setAttribute("download", "notes.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error generating PDF:", error);
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

            {/* Generate PDF button */}
            <Button
              variant="contained"
              color="success"
              onClick={generatePdf}
              startIcon={<PictureAsPdf />}
              disabled={recognition !== null} // Enable only when recognition is not active
              style={{ float: "right", marginTop: "16px" }}
              aria-label="Generate PDF"
            >
              Generate PDF
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
