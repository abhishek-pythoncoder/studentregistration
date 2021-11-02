import React, { useState } from "react";

import { Checkbox, Tag } from "@chakra-ui/react";
const AttendanceCheckBox = ({ isPresent, handler, idx, isReadOnly }) => {
  const [checked, toggel] = useState(isPresent);
  return !isReadOnly ? (
    <Checkbox
      isChecked={checked}
      onChange={(e) => {
        toggel(e.target.checked);
        handler(idx, e.target.checked);
      }}
      colorScheme="orange"
      isReadOnly={isReadOnly}
    >
      {checked ? (
        <Tag color="white" backgroundColor="secondary.green">
          Present
        </Tag>
      ) : (
        <Tag color="white" backgroundColor="secondary.red">
          Absent
        </Tag>
      )}
    </Checkbox>
  ) : checked ? (
    <Tag color="white" backgroundColor="secondary.green">
      Present
    </Tag>
  ) : (
    <Tag color="white" backgroundColor="secondary.red">
      Absent
    </Tag>
  );
};

export default AttendanceCheckBox;
