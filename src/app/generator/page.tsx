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
} from "@mantine/core";
import NavBar from "../components/navbar";
import SvgSetup from "./svgSetup";
import PdfSetup from "./pdfSetup";
import { useForm } from "@mantine/form";

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
      const canvas = document.getElementById(
        "generatedCanvas"
      ) as HTMLCanvasElement;

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
            ctx.drawImage(img, 0, 0, width, height);
          };

          img.src = svgUrl;
        }
      }
    }
  }, [activeStep, svgGenerated, svgBlob]);

  const handleSvgSubmit = async () => {
    console.log("Selected Task:", selectedTask);
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
        downloadLink.download = `${formData.taskTitle.replace(/\s/g, "_")}.pdf`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } catch (error) {
        console.error("Hiba a PDF generálása közben:", error);
      }
    }
  };

  return (
    <>
      <NavBar />
      <Container>
        <Space h="sm" />
        <Paper shadow="lg" radius="lg" p="md" withBorder>
          <Title>Gráf feladat generátor</Title>
          <Space h="sm" />

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
              <SvgSetup form={svgForm} selectedTask={selectedTask} setSelectedTask={setSelectedTask} />
              <Group justify="center" align="center">
                <Button onClick={handleSvgSubmit}>SVG generálása</Button>
                <Button
                  onClick={() => {
                    if (svgBlob) {
                      const downloadLink = document.createElement("a");
                      downloadLink.href = URL.createObjectURL(svgBlob);
                      downloadLink.download = "generated-graph.svg";
                      document.body.appendChild(downloadLink);
                      downloadLink.click();
                      document.body.removeChild(downloadLink);
                    }
                  }}
                  disabled={!svgGenerated || !svgBlob}
                  variant="light"
                  color="green"
                >
                  SVG Letöltése
                </Button>
                <Button
                  onClick={() => setActiveStep(activeStep + 1)}
                  disabled={!svgGenerated}
                  variant="light"
                  color="blue"
                >
                  Következő lépés
                </Button>
              </Group>
              <Flex
                justify="center"
                align="center"
                direction="column"
                style={{
                  width: "100%",
                  height: "65vh",
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
                    <Text style={{ marginTop: "1rem", marginBottom: 0 }}>
                      A generált gráf:
                    </Text>
                    <canvas
                      id="generatedCanvas"
                      style={{
                        border: "1px solid black",
                        display: svgGenerated ? "block" : "none",
                        maxWidth: "100%",
                        maxHeight: "100%",
                        margin: "auto",
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
                <Button onClick={() => setActiveStep(activeStep - 1)}>
                  Vissza
                </Button>
                <Button onClick={handlePdfSubmit} disabled={!svgGenerated}>
                  PDF generálása
                </Button>
              </Group>
            </Stepper.Step>
          </Stepper>
        </Paper>
        <Space h="md" />
      </Container>
    </>
  );
}
