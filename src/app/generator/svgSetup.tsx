import { useEffect, useState } from "react";
import {
  Checkbox,
  NumberInput,
  Select,
  Space,
} from "@mantine/core";
import "dayjs/locale/hu";

type FormValues = {
  taskTypes: string | null;
  graphNodes: number | null;
  graphEdges: number | null;
  connectedGraph: boolean;
};

interface SvgProps {
  form: any;
  selectedTask: string;
  setSelectedTask: React.Dispatch<React.SetStateAction<string>>;
}

export default function SvgSetup({ form, selectedTask, setSelectedTask }: SvgProps) {
  const taskTypes = [
    "szélességi bejárás",
    "mélységi bejárás",
    "topologikus rendezés",
  ];

  const graphTypes = [
    "irányítatlan",
    "irányított"
  ];

  return (
    <>
      <Select
        label="Feladattípus"
        description="Válassz feladattípust"
        data={taskTypes}
        placeholder="Válassz feladattípust"
        value={selectedTask}
        onChange={(value) => {
          setSelectedTask(value || "");
          form.setFieldValue("selectedTask", value || "");
        }}
        error={form.errors.selectedTask}
        clearable
      />
      <Space h="sm" />
      <Select
        label="Gráf típusa"
        description="Válassz gráf típust"
        data={graphTypes}
        placeholder="Válassz gráf típust"
        value={form.values.graphType}
        onChange={(value) => {
          form.setFieldValue("graphType", value || "");
        }}
        error={form.errors.graphType}
        clearable
      />
      <Space h="sm" />
      <NumberInput
        label="Gráf csúcsainak száma"
        description="Add meg a gráf csúcsainak számát"
        placeholder="Adj meg egy számot"
        min={2}
        max={10}
        withAsterisk
        {...form.getInputProps("graphNodes")}
        error={form.errors.graphNodes}
      />
      <Space h="sm" />
      {/* <Checkbox
        label="Összefüggő gráf"
        description="Jelöld be, ha az elkészítendő gráf összefüggő"
        {...form.getInputProps("connectedGraph")}
        checked
        disabled
      />
      <Space h="sm" /> */}
      <NumberInput
        label="Gráf éleinek száma"
        description="Add meg a gráf éleinek számát"
        placeholder="Adj meg egy számot"
        min={form.values.graphNodes ? form.values.graphNodes - 1 : 1}
        max={
          form.values.graphNodes
            ? (form.values.graphNodes * (form.values.graphNodes - 1)) / 2
            : 10
        }
        withAsterisk
        {...form.getInputProps("graphEdges")}
        error={form.errors.graphEdges}
      />
      <Space h="sm" />
    </>
  );
}