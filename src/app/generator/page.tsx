"use client";

import { useEffect, useState, useRef } from "react";
import {
  Container,
  Flex,
  Group,
  LoadingOverlay,
  Paper,
  Space,
  Stepper,
  Title,
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

/* type FormValues = {
  graphNodes: number | null;
  graphEdges: number | null;
  connectedGraph: boolean;
  taskTitle: string;
  taskText: string;
  dateChecked: boolean;
  date: Date | null;
}; */

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
  const [svgError, setSvgError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Az SVG generálás formja és validációja
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
          ? "Topologikus rendezéshez (irányított) körmentes gráf szükséges!"
          : null,
    },
  });

// Az PDF generálás formja és validációja
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

  // Ha az SVG generálása sikeresen megtörtént, akkor a generált SVG-t megjelenítjük
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

  // Az SVG generálás során a felhasználó által megadott adatok alapján SVG-t generálunk a backend segítségével
  const handleSvgSubmit = async () => {
    setSvgError(null);
    setLoading(true);
    svgForm.validate();

    if (svgForm.isValid()) {
      const formData = svgForm.values;
      const svgDataToSend = {
        taskType: selectedTask,
        ...formData,
      };

      // A backend visszaküldi a generált SVG-t vagy a felmerült hibát
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
        setFilename(filename);
        setSvgBlob(svgBlob);
        setSvgGenerated(true);
        setTaskPdfPath(null);
        setSolutionPdfPath(null);
      } catch (error) {
        console.error("Hiba az SVG generálása közben:", error);
        // A hibaüzenetet megjelenítjük
        if (error instanceof Error) {
          setSvgError("Hibaüzenet: " + error.message);
        } else {
          setSvgError("Ismeretlen hiba történt.");
        }
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  // Az PDF generálás során a felhasználó által megadott adatok alapján PDF-t generálunk a backend segítségével
  const handlePdfSubmit = async () => {
    setPdfError(null);
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

      // A backend visszaküldi a generált PDF fájlokat vagy a felmerült hibát
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
        setSolutionPdfPath(result.solutionPdf);
        setPdfGenerated(true);
      } catch (error) {
        console.error("Hiba a PDF generálása közben:", error);
        // A hibaüzenetet megjelenítjük
        if (error instanceof Error) {
          setPdfError("Hibaüzenet: " + error.message);
        } else {
          setPdfError("Ismeretlen hiba történt.");
        }
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
                {/* Hiba esetén a gomb színe megváltozik és az egeret felé mozgatva megjelenik a hibaüzenet */}
                {svgError ? (
                  <Tooltip
                    radius="xs"
                    label={svgError || "SVG generálása"}
                    position="bottom"
                    offset={10}
                    withArrow
                    color={svgError ? "#c00000" : undefined}
                  >
                    <button
                      className={`${styles.buttonGenerate} ${
                        loading && (!svgGenerated || !svgBlob)
                          ? styles.buttonDisabled
                          : ""
                      } ${svgError ? styles.buttonGenerateError : ""}`}
                      role="button"
                      onClick={handleSvgSubmit}
                    >
                      {loading ? (
                        <span className={styles.loadingText}>generálás</span>
                      ) : (
                        "SVG generálása"
                      )}
                    </button>
                  </Tooltip>
                ) : (
                  <button
                    className={`${styles.buttonGenerate} ${
                      loading && (!svgGenerated || !svgBlob)
                        ? styles.buttonDisabled
                        : ""
                    } ${svgError ? styles.buttonGenerateError : ""}`}
                    role="button"
                    onClick={handleSvgSubmit}
                  >
                    {loading ? (
                      <span className={styles.loadingText}>generálás</span>
                    ) : (
                      "SVG generálása"
                    )}
                  </button>
                )}
                <Tooltip
                  radius="xs"
                  label="SVG letöltése"
                  position="bottom"
                  offset={10}
                  withArrow
                >
                  <button
                    className={`${styles.buttonDownload} ${
                      !svgGenerated || !svgBlob ? styles.buttonDisabled : "" // Ha nincs generált SVG, akkor a gomb inaktív
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
                    !svgGenerated ? styles.buttonDisabled : "" // Ha nincs generált SVG, akkor a gomb inaktív
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
                {/* Ha sikeres az SVG generálás, akkor az SVG képe megjelenik */}
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
                {/* Hiba esetén a gomb színe megváltozik és az egeret felé mozgatva megjelenik a hibaüzenet */}
                {pdfError ? (
                  <Tooltip
                    radius="xs"
                    label={pdfError}
                    position="bottom"
                    offset={10}
                    withArrow
                    color={pdfError ? "#c00000" : undefined}
                  >
                    <button
                      className={`${styles.buttonGenerate} ${
                        pdfLoading && (!pdfGenerated || !taskPdfPath)
                          ? styles.buttonDisabled
                          : ""
                      } ${pdfError ? styles.buttonGenerateError : ""}`}
                      role="button"
                      onClick={handlePdfSubmit}
                    >
                      {pdfLoading ? (
                        <span className={styles.loadingText}>generálás</span>
                      ) : (
                        "PDF generálása"
                      )}
                    </button>
                  </Tooltip>
                ) : (
                  <button
                    className={`${styles.buttonGenerate} ${
                      pdfLoading && (!pdfGenerated || !taskPdfPath)
                        ? styles.buttonDisabled
                        : ""
                    }`}
                    role="button"
                    onClick={handlePdfSubmit}
                  >
                    {pdfLoading ? (
                      <span className={styles.loadingText}>generálás</span>
                    ) : (
                      "PDF generálása"
                    )}
                  </button>
                )}
              </Group>
              {/* A PDF letöltésére szolgáló gomb csak akkor jelenik meg, ha a PDF generálás sikeres volt */}
              {taskPdfPath && solutionPdfPath && (
                <Group justify="center" align="center" mt="md">
                  <button
                    className={`${styles.buttonGenerate}`}
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
                    className={`${styles.buttonGenerate}`}
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
