import {
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Box,
  useColorModeValue,
} from "@chakra-ui/react";

export default function FarmsTVLCard() {
  return (
    <Box
      m="3"
      //maxW="50rem"
      textAlign="center"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={useColorModeValue("gray.50", "gray.900")}
    >
      <Box m="3">
        <StatGroup>
          <Stat>
            <StatLabel>BOND</StatLabel>
            <StatNumber>111</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>SWINGBY</StatLabel>
            <StatNumber>222</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>XYZ </StatLabel>
            <StatNumber>333</StatNumber>
          </Stat>
        </StatGroup>
      </Box>
    </Box>
  );
}