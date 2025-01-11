import { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Container,
  Group,
  NumberInput,
  Paper,
  Select,
  Space,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
  useMantineColorScheme,
} from "@mantine/core";
import { DateInput, DatePicker, DatesProvider } from "@mantine/dates";
import "dayjs/locale/hu";
import { rem } from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";

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

  return (
    <>
      <Select
        label="Feladattípus"
        description="Válassz feladattípust"
        data={taskTypes}
        placeholder="Válassz feladattípust"
        value={selectedTask}
        onChange={(value) => setSelectedTask(value || "")}
        clearable
      />
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
      <Checkbox
        label="Összefüggő gráf"
        description="Jelöld be, ha az elkészítendő gráf összefüggő"
        {...form.getInputProps("connectedGraph")}
        checked
        disabled
      />
      <Space h="sm" />
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
