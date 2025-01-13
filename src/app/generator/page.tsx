"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Container,
  Flex,
  Group,
  Paper,
  Space,
  Stepper,
  Title,
  Text,
  Tooltip,
  useMantineColorScheme,
} from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import NavBar from "../components/navbar";
import SvgSetup from "./svgSetup";
import PdfSetup from "./pdfSetup";
import { useForm } from "@mantine/form";

import styles from "../components/buttons.module.css";

type FormValues = {
  graphNodes: number | null;
  graphEdges: number | null;
  connectedGraph: boolean;
  taskTitle: string;
  taskText: string;
  dateChecked: boolean;
  date: Date | null;
};

export default function Page() {
  const [selectedTask, setSelectedTask] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [svgGenerated, setSvgGenerated] = useState(false);
  const [svgBlob, setSvgBlob] = useState<Blob | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const { colorScheme } = useMantineColorScheme();

  const svgForm = useForm({
    initialValues: {
      graphNodes: null,
      graphEdges: null,
      connectedGraph: true,
    },
    validate: {
      graphNodes: (value) => (value ? null : "Gráf csúcsainak száma kötelező!"),
      graphEdges: (value) => (value ? null : "Gráf éleinek száma kötelező!"),
    },
  });

  const pdfForm = useForm({
    initialValues: {
      generatePdf: false,
      taskTitle: "",
      taskText: "",
      dateChecked: false,
      date: null,
    },
    validate: {
      taskTitle: (value) => (value ? null : "Feladat cím megadása kötelező!"),
      taskText: (value) => (value ? null : "Feladat szöveg megadása kötelező!"),
      date: (value) =>
        pdfForm.values.dateChecked && !value
          ? "Dátum megadása kötelező!"
          : null,
    },
  });

  useEffect(() => {
    if (activeStep === 0 && svgGenerated && svgBlob) {
      const canvas = document.getElementById("generatedCanvas") as HTMLCanvasElement;
  
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const img = new Image();
          const svgUrl = URL.createObjectURL(svgBlob);
  
          img.onload = () => {
            const scale = 0.5;
            const width = img.width * scale;
            const height = img.height * scale;
  
            canvas.width = width;
            canvas.height = height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = colorScheme === "dark" ? "grey" : "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, width, height);
          };
  
          img.src = svgUrl;
        }
      }
    }
  }, [activeStep, svgGenerated, svgBlob, colorScheme]);

  const handleSvgSubmit = async () => {
    /* console.log("Selected Task:", selectedTask); */
    svgForm.validate();

    if (svgForm.isValid()) {
      const formData = svgForm.values;
      const svgDataToSend = {
        taskType: selectedTask,
        ...formData,
      };

      try {
        const response = await fetch("http://localhost:8000/api/generate-svg", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(svgDataToSend),
        });

        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const svgBlob = await response.blob();
        const filename = response.headers.get("X-Filename");
        /* console.log("Received filename:", filename); */
        setFilename(filename);
        setSvgBlob(svgBlob);
        setSvgGenerated(true);
      } catch (error) {
        console.error("Hiba az SVG generálása közben:", error);
      }
    }
  };

  const handlePdfSubmit = async () => {
    pdfForm.validate();

    if (pdfForm.isValid()) {
      const formData = pdfForm.values;
      const pdfDataToSend = {
        taskType: selectedTask,
        ...formData,
        svgFilename: filename,
      };

      try {
        const response = await fetch("http://localhost:8000/api/generate-pdf", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pdfDataToSend),
        });

        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const pdfBlob = await response.blob();
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(pdfBlob);
        downloadLink.download = filename
          ? filename.replace(".svg", ".pdf")
          : "generated.pdf";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } catch (error) {
        console.error("Hiba a PDF generálása közben:", error);
      }
    }
  };

/*   console.log("Filename:", filename);
  console.log("Scheme:", colorScheme); */

  return (
    <>
      <NavBar />
      <Container>
        <Space h="sm" />
        <Paper shadow="lg" radius="lg" p="md" withBorder>
          <Title>Gráf feladat generátor</Title>
          <Space h="xl" />
          <Stepper
            active={activeStep}
            onStepClick={setActiveStep}
            allowNextStepsSelect={false}
          >
            <Stepper.Step
              label="SVG generálás"
              description="Gráf SVG generálása"
              allowStepSelect={svgGenerated}
            >
              <SvgSetup
                form={svgForm}
                selectedTask={selectedTask}
                setSelectedTask={setSelectedTask}
              />
              <Group justify="center" align="center">
                {/* <Button onClick={handleSvgSubmit}>SVG generálása</Button> */}
                {/* <Tooltip label="SVG generálása" position="bottom" offset={10} withArrow> */}
                <button
                  className={styles.buttonGenerate}
                  role="button"
                  onClick={handleSvgSubmit}
                >
                  SVG generálása
                </button>
                {/* </Tooltip> */}
                {/* <Button
                  className={styles.button54}
                  onClick={() => {
                    if (svgBlob) {
                      const downloadLink = document.createElement("a");
                      downloadLink.href = URL.createObjectURL(svgBlob);
                      downloadLink.download = filename || "graph.svg";
                      document.body.appendChild(downloadLink);
                      downloadLink.click();
                      document.body.removeChild(downloadLink);
                    }
                  }}
                  disabled={!svgGenerated || !svgBlob}
                  
                  color: "#557834"
                >
                  SVG Letöltése
                </Button> */}
                <Tooltip radius="xs" label="SVG letöltése" position="bottom" offset={10} withArrow>
                <button
                  className={`${styles.buttonDownload} ${!svgGenerated || !svgBlob ? styles.buttonDisabled : ''} ${colorScheme === "dark" ? styles.buttonDownloadDark : ''} `}
                  onClick={() => {
                    if (svgBlob) {
                      const downloadLink = document.createElement("a");
                      downloadLink.href = URL.createObjectURL(svgBlob);
                      downloadLink.download = filename || "graph.svg";
                      document.body.appendChild(downloadLink);
                      downloadLink.click();
                      document.body.removeChild(downloadLink);
                    }
                  }}
                  disabled={!svgGenerated || !svgBlob}
                >
                  <IconDownload size={12} color='black'/>
                </button>
                </Tooltip>
                {/* <Button
                  onClick={() => setActiveStep(activeStep + 1)}
                  disabled={!svgGenerated}
                  variant="light"
                  color="blue"
                >
                  Következő lépés
                </Button> */}
                {/* <Tooltip label="Következő lépés" position="bottom" offset={10} withArrow> */}
                <button
                  className={`${styles.buttonNextStep} ${!svgGenerated ? styles.buttonDisabled : ''} ${colorScheme === "dark" ? styles.buttonNextStepDark : ''}`}
                  onClick={() => setActiveStep(activeStep + 1)}
                  disabled={!svgGenerated}
                >
                  Következő lépés
                </button>
                {/* </Tooltip> */}
              </Group>
              <Flex
                justify="center"
                align="center"
                direction="column"
                style={{
                  width: "100%",
                  height: "70%",
                }}
              >
                <Space h="sm" />
                {svgGenerated && (
                  <div
                    id="svgContainer"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                      width: "100%",
                      overflow: "hidden",
                    }}
                  >
                    {/* <Text style={{ marginTop: "20px", marginBottom: "20px" }}>
                      A generált gráf:
                    </Text> */}
                    <canvas
                      id="generatedCanvas"
                      style={{
                        border: "1px solid black",
                        display: svgGenerated ? "block" : "none",
                        maxWidth: "100%",
                        maxHeight: "100%",
                        /* margin: "auto", */
                        marginTop: "40px",
                        marginBottom: "30px",
                      }}
                    ></canvas>
                  </div>
                )}
              </Flex>
            </Stepper.Step>

            <Stepper.Step
              label="PDF generálás"
              description="Gráf PDF generálása"
            >
              <PdfSetup form={pdfForm} />
              <Space h="sm" />
              <Group justify="center">
                {/* <Button onClick={() => setActiveStep(activeStep - 1)}>
                  Vissza
                </Button> */}
                <button className={`${styles.buttonPrevStep} ${colorScheme === "dark" ? styles.buttonPrevStepDark : ''}`} onClick={() => setActiveStep(activeStep - 1)}>
                  Vissza
                </button>
                {/* <Button onClick={handlePdfSubmit} disabled={!svgGenerated}>
                  PDF generálása
                </Button> */}
                <button className={styles.buttonGenerate} onClick={handlePdfSubmit} disabled={!svgGenerated}>
                  PDF generálása
                </button>
              </Group>
            </Stepper.Step>
          </Stepper>
        </Paper>
        <Space h="md" />
      </Container>
    </>
  );
}
