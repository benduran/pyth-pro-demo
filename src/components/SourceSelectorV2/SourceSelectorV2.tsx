import { sentenceCase } from "change-case";
import { Dropdown } from "primereact/dropdown";
import { useMemo } from "react";

import classes from "./SourceSelectorV2.module.css";
import { useAppStateContext } from "../../context";
import type {
  AllAllowedSymbols,
  GroupedSourceSelectorOptType,
} from "../../types";
import {
  GROUPED_SOURCE_SELECTOR_OPTS,
  NO_SELECTION_VAL,
  SOURCE_SELECTOR_OPTS,
} from "../../types";

export function SourceSelectorV2() {
  /** context */
  const { handleSelectSource, selectedSource } = useAppStateContext();

  /** memos */
  const selectedOpt = useMemo(
    () =>
      SOURCE_SELECTOR_OPTS.find((opt) => opt.value === selectedSource) ??
      SOURCE_SELECTOR_OPTS.find((opt) => opt.value === NO_SELECTION_VAL),
    [selectedSource],
  );

  return (
    <Dropdown
      className={classes.root}
      onChange={(e) => {
        handleSelectSource(e.value as AllAllowedSymbols);
      }}
      options={GROUPED_SOURCE_SELECTOR_OPTS}
      optionGroupLabel="label"
      optionGroupChildren="items"
      optionGroupTemplate={(group: GroupedSourceSelectorOptType) =>
        sentenceCase(group.label)
      }
      value={selectedOpt?.value}
    />
  );
}
