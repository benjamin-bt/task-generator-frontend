"use client";

import { useEffect, useState, useRef } from "react";
import {
  Button,
  Container,
  Flex,
  Group,
  LoadingOverlay,
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

require("dotenv").config();

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
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [svgBlob, setSvgBlob] = useState<Blob | null>(null);
  const [pdfResult, setPdfResult] = useState<Blob | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [taskPdfPath, setTaskPdfPath] = useState<string | null>(null);
  const [solutionPdfPath, setSolutionPdfPath] = useState<string | null>(null);
  const { colorScheme } = useMantineColorScheme();
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [nodeListBack, setNodeListBack] = useState([]);

  const svgForm = useForm({
    initialValues: {
      graphType: "",
      graphNodes: null,
      graphEdges: null,
      acyclicGraph: false,
      selectedTask: "",
    },
    validate: {
      graphType: (value) =>
        value ? null : "Gráf típusának kiválasztása kötelező!",
      graphNodes: (value) => (value ? null : "Gráf csúcsainak száma kötelező!"),
      graphEdges: (value) => (value ? null : "Gráf éleinek száma kötelező!"),
      selectedTask: (value, values) => {
        if (!value) {
          return "Feladattípus kiválasztása kötelező!";
        }
        if (
          values.graphType === "irányítatlan" &&
          value === "topologikus rendezés"
        ) {
          return "Topologikus rendezés csak irányított gráf esetén választható!";
        }
        return null;
      },
      acyclicGraph: (value, values) =>
        values.selectedTask === "topologikus rendezés" && !value
          ? "Topologikus rendezéshez (irányított) aciklikus gráf szükséges!"
          : null,
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
    setLoading(true);
    svgForm.validate();

    if (svgForm.isValid()) {
      const formData = svgForm.values;
      const svgDataToSend = {
        taskType: selectedTask,
        ...formData,
      };

      console.log("Backend URL:", process.env.NEXT_PUBLIC_BACKEND);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/generate-svg`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(svgDataToSend),
          }
        );

        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const svgBlob = await response.blob();
        const filename = response.headers.get("X-Filename");
        const nodeList = response.headers.get("X-Node-List");

        setNodeListBack(nodeList ? JSON.parse(nodeList) : []);
        console.log("Node list:", nodeList);
        console.log("Node list back:", nodeListBack);
        setFilename(filename);
        setSvgBlob(svgBlob);
        setSvgGenerated(true);
        setTaskPdfPath(null);
        setSolutionPdfPath(null);
      } catch (error) {
        console.error("Hiba az SVG generálása közben:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const handlePdfSubmit = async () => {
    setTaskPdfPath(null);
    setSolutionPdfPath(null);
    setPdfLoading(true);
    pdfForm.validate();

    if (pdfForm.isValid()) {
      const formData = pdfForm.values;
      const pdfDataToSend = {
        taskType: selectedTask,
        graphType: svgForm.values.graphType,
        nodeListBack: nodeListBack.length > 0 ? nodeListBack : [],
        ...formData,
        svgFilename: filename,
      };

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/generate-pdf`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(pdfDataToSend),
          }
        );

        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const result = await response.json();
        setTaskPdfPath(result.taskPdf);
        setPdfResult(result);
        setSolutionPdfPath(result.solutionPdf);
        setPdfGenerated(true);
      } catch (error) {
        console.error("Hiba a PDF generálása közben:", error);
      } finally {
        setPdfLoading(false);
      }
    } else {
      setPdfLoading(false);
    }
  };

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
                <button
                  className={`${styles.buttonGenerate} 
                  ${
                    loading && (!svgGenerated || !svgBlob)
                      ? styles.buttonDisabled
                      : ""
                  } ${colorScheme === "dark" ? styles.buttonGenerateDark : ""}`}
                  role="button"
                  onClick={handleSvgSubmit}
                >
                  {loading ? (
                    <span className={styles.loadingText}>generálás</span>
                  ) : (
                    "SVG generálása"
                  )}
                </button>
                <Tooltip
                  radius="xs"
                  label="SVG letöltése"
                  position="bottom"
                  offset={10}
                  withArrow
                >
                  <button
                    className={`${styles.buttonDownload} ${
                      !svgGenerated || !svgBlob ? styles.buttonDisabled : ""
                    } ${
                      colorScheme === "dark" ? styles.buttonDownloadDark : ""
                    } `}
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
                    <IconDownload size={12} color="black" />
                  </button>
                </Tooltip>
                <button
                  className={`${styles.buttonNextStep} ${
                    !svgGenerated ? styles.buttonDisabled : ""
                  } ${colorScheme === "dark" ? styles.buttonNextStepDark : ""}`}
                  style={{ width: "178.8px" }}
                  onClick={() => setActiveStep(activeStep + 1)}
                  disabled={!svgGenerated}
                >
                  Következő lépés
                </button>
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
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <LoadingOverlay visible={loading} />
                    <canvas
                      id="generatedCanvas"
                      style={{
                        border: "1px solid black",
                        display: svgGenerated ? "block" : "none",
                        maxWidth: "100%",
                        maxHeight: "100%",
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
                <button
                  className={`${styles.buttonPrevStep} ${
                    colorScheme === "dark" ? styles.buttonPrevStepDark : ""
                  }`}
                  onClick={() => setActiveStep(activeStep - 1)}
                >
                  Vissza
                </button>
                <button
                  className={`${styles.buttonGenerate} 
                  ${
                    loading && (!pdfGenerated || !pdfResult)
                      ? styles.buttonDisabled
                      : ""
                  } ${colorScheme === "dark" ? styles.buttonGenerateDark : ""}`}
                  onClick={handlePdfSubmit}
                  disabled={pdfLoading}
                >
                  {pdfLoading ? (
                    <span className={styles.loadingText}>generálás</span>
                  ) : (
                    "PDF generálása"
                  )}
                </button>
              </Group>
              {taskPdfPath && solutionPdfPath && (
                <Group justify="center" align="center" mt="md">
                  <button
                    className={`${styles.buttonGenerate} ${
                      colorScheme === "dark" ? styles.buttonGenerateDark : ""
                    }`}
                    onClick={() => {
                      const downloadLink = document.createElement("a");
                      downloadLink.href = `${process.env.NEXT_PUBLIC_BACKEND}${taskPdfPath}`;
                      downloadLink.download = "";
                      downloadLink.target = "_blank"; // Open in new tab
                      document.body.appendChild(downloadLink);
                      downloadLink.click();
                      document.body.removeChild(downloadLink);
                    }}
                  >
                    Feladat PDF letöltése
                  </button>

                  <button
                    className={`${styles.buttonGenerate} ${
                      colorScheme === "dark" ? styles.buttonGenerateDark : ""
                    }`}
                    onClick={() => {
                      const downloadLink = document.createElement("a");
                      downloadLink.href = `${process.env.NEXT_PUBLIC_BACKEND}${solutionPdfPath}`;
                      downloadLink.download = "";
                      downloadLink.target = "_blank"; // Open in new tab
                      document.body.appendChild(downloadLink);
                      downloadLink.click();
                      document.body.removeChild(downloadLink);
                    }}
                  >
                    Megoldás PDF letöltése
                  </button>
                </Group>
              )}
            </Stepper.Step>
          </Stepper>
        </Paper>
        <Space h="md" />
      </Container>
    </>
  );
}
