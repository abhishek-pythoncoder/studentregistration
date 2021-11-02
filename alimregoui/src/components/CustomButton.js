import { Button } from "@chakra-ui/button";
import React, { useState } from "react";

const CustomButton = ({ handleFuction, label, style }) => {
  const [isLoading, toggelLoading] = useState(false);

  const handleClick = () => {
    toggelLoading(!isLoading);
    handleFuction();
  };
  return (
    <Button isLoading={isLoading} onClick={handleClick} {...style} _hover={{}} type="button">
      {label}
    </Button>
  );
};

export default CustomButton;
