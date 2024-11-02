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

function App() {
  const [uuid, setUuid] = useState("");
  const [file, setFile] = useState(null);
  const [uploadEnable, setUploadEnable] = useState(true)
  const [uuidCheck, setuuidCheck] = useState("Generate / Enter UUID to upload Context")
  const [message, setMessage] = useState("");


  const generateUuid = () => {
    const newUuid = uuidv4();
    setUuid(newUuid);
    setMessage(`Generated UUID: ${newUuid}`);
    setUploadEnable(false)
    setuuidCheck("Upload Context")
  };

  
  const handleUuidChange = (event) => {
    setUuid(event.target.value);
    if(event.target.value.length>10) {
      console.log("GOT YOUR UUID")
      setUploadEnable(false)
      setuuidCheck("Upload Context")
    }
    else {
      console.log("NEED A LONGER UUID")
      setUploadEnable(true)
      setuuidCheck("Need a longer UUID ( At least 10 Char )")
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
              style={{ marginBottom: "16px" }}
            />

            <Button
              variant="contained"
              component="label"
              fullWidth
              color="secondary"
              style={{ marginBottom: "16px" }}
            >
              {uuidCheck}
              <input
                type="file"
                hidden
                disabled={uploadEnable}
                accept=".txt, .pdf, .ppt, .pptx, .doc, .docx"
                onChange={handleFileChange}
              />
            </Button>

            {message && (
              <Typography color="textSecondary" variant="body1">
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
              Right Panel (Content Area)
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Content for the right panel will go here.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
