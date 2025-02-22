import { useState } from "react";
import {
  Checkbox,
  Space,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import "dayjs/locale/hu";
import { rem } from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";

type FormValues = {
  generatePdf: boolean;
  graphNodes: number | null;
  graphEdges: number | null;
  connectedGraph: boolean;
  taskTitle: string;
  taskText: string;
  dateChecked: boolean;
  date: Date | null;
};

interface PdfProps {
  form: any;
}

export default function PdfSetup({ form }: PdfProps) {
  const dateIcon = (
    <IconCalendar style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
  );

  return (
    <>
      <TextInput
        label="Feladat címe"
        placeholder="Add meg a feladat címét"
        {...form.getInputProps("taskTitle")}
      />
      <Space h="sm" />
      <TextInput
        label="Feladat szövege"
        placeholder="Add meg a feladat szövegét"
        {...form.getInputProps("taskText")}
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
    </>
  );
}