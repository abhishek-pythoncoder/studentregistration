// 1. Import `extendTheme`
import { extendTheme } from "@chakra-ui/react";

// 2. Call `extendTheme` and pass your custom values
const theme = extendTheme({
  colors: {
    brand: {
      orange: "#E55C18",
      green: "#E5FFE5",
    },
    secondary: {
      black: "#000000",
      white: "#ffffff",
      red: "#DA1E28",
      green: "#4BB543",
      orange: "#DD6B20",
    },
  },
  fonts: {
    heading: "Space Grotesk",
    body: "Inter",
  },
  components: {
    Input: {
      variants: {
        outline: {
          field: {
            bg: "#ffffff",
          },
        },
      },
    },
    Textarea: {
      variants: {
        outline: {
          bg: "#ffffff",
        },
      },
    },
    Select: {
      variants: {
        outline: {
          field: {
            bg: "#ffffff",
          },
        },
      },
    },
  },
});

export default theme;
