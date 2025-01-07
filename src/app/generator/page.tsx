"use client";

import {
  Button,
  Container,
  Group,
  NumberInput,
  Paper,
  Select,
  Space,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";

import NavBar from "../components/navbar";

import TopologikusRendezes from "../tasks/topologikus_rendezes";
import MelysegiBejaras from "../tasks/melysegi_bejaras";
import SzelessegiBejaras from "../tasks/szelessegi_bejaras";

import { useForm } from "@mantine/form";
import { useState } from "react";

type FormValues = {
  graphNodes: number | null;
  graphEdges: number | null;
  taskTitle: string;
  taskText: string;
  dateChecked: boolean;
  date: Date | null;
};

export default function Page() {
  const taskTypes = ["szélességi bejárás", "mélységi bejárás", "topologikus rendezés"];
  const [selectedTask, setSelectedTask] = useState("");

  const form = useForm({
    initialValues: {
      graphNodes: null,
      graphEdges: null,
      taskTitle: "",
      taskText: "",
      dateChecked: false,
      date: null,
    },

    validate: {
      graphNodes: (value) => (value ? null : "Gráf csúcsainak száma kötelező!"),
      graphEdges: (value) => (value ? null : "Gráf éleinek száma kötelező!"),
      taskTitle: (value) => (value ? null : "Feladat cím megadása kötelező!"),
      taskText: (value) => (value ? null : "Feladat szöveg megadása kötelező!"),
      date: (value) => (form.values.dateChecked && !value ? "Dátum megadása kötelező!" : null),

      
    },
  });

  const handleSubmit = () => {
    form.validate();

    if (form.isValid()) {
      const formData = form.values;
      const dataToSend = {
        taskType: selectedTask,
        ...formData,
      };
      
      console.log("Adatcsomag küldése a backend felé:", dataToSend);
      
    } else {
      console.log("Érvénytelen kitöltés!");
    }
  };

  const renderTaskComponent = () => {
    switch (selectedTask) {
      case "szélességi bejárás":
        return <SzelessegiBejaras form={form} />;
      case "mélységi bejárás":
        return <MelysegiBejaras form={form} />;
      case "topologikus rendezés":
        return <TopologikusRendezes form={form} />;
      default:
        return null;
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
          <Select
            label="Feladattípus"
            description="Válassz feladattípust"
            data={taskTypes}
            placeholder="Válassz feladattípust"
            value={selectedTask}
            onChange={(value) => setSelectedTask(value || "")}
            clearable
          />
          <Space h="xs" />
          {renderTaskComponent()}
          <Space h="lg" />
          <Tooltip label="Erre kattintva elindul a feladat generálása a megadott attribútumok szerint." position="right" withArrow>
            <Button color="#40798c" onClick={handleSubmit}>
              Feladat generálása
            </Button>
          </Tooltip>
        </Paper>
      </Container>
    </>
  );
}
