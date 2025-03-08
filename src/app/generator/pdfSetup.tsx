/* import { useState } from "react"; */
import {
  Checkbox,
  Divider,
  /* Select, */
  Space,
  Textarea,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import "dayjs/locale/hu";
import { rem } from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";

/* type FormValues = {
  generatePdf: boolean;
  graphType: string;
  graphNodes: number | null;
  graphEdges: number | null;
  acyclicGraph: boolean;
  taskTypes: string | null;
  taskTitle: string;
  taskText: string;
  dateChecked: boolean;
  date: Date | null;
}; */

interface PdfProps {
  form: any;
  /* selectedTask: string;
  setSelectedTask: React.Dispatch<React.SetStateAction<string>>; */
}

export default function PdfSetup({
  form /* , selectedTask, setSelectedTask */,
}: PdfProps) {
  /* const taskTypes = [
    "szélességi bejárás",
    "mélységi bejárás",
    "topologikus rendezés",
  ]; */

  const dateIcon = (
    <IconCalendar style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
  );

  return (
    <>
      {/* <Select
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
          /> */}
      <Space h="sm" />
      <TextInput
        label="Feladat címe"
        placeholder="Add meg a feladat címét"
        {...form.getInputProps("taskTitle")}
        maxLength={120}
      />
      <Space h="sm" />
      <Textarea
        label="Feladat szövege"
        placeholder="Add meg a feladat szövegét"
        {...form.getInputProps("taskText")}
        maxLength={1100}
      />
      <Space h="sm" />
      <Checkbox
        label="Dátum megadása"
        checked={form.values.dateChecked}
        onChange={(event) =>
          form.setFieldValue("dateChecked", event.currentTarget.checked)
        }
      />
      <Space h="sm" />
      {form.values.dateChecked && (
        <DateInput
          label="Dátum"
          placeholder="Válassz dátumot"
          icon={dateIcon}
          locale="hu"
          {...form.getInputProps("date")}
        />
      )}
      <Space h="md" />
      <Divider />
      <Space h="xs" />
    </>
  );
}