import "./../App.css";
import Header from "./../components/header";
import Footer from "./../components/footer";
import React from "react";
import { useTable, useSortBy } from "react-table";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Container,
  Box,
  useColorModeValue,
  Text,
  Skeleton,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Label,
} from "recharts";

import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";

import { getAllHoldersData } from "./../utils/userStats";

const benfordProbabilities = {
  0: 0,
  1: 0.301,
  2: 0.176,
  3: 0.125,
  4: 0.097,
  5: 0.079,
  6: 0.067,
  7: 0.058,
  8: 0.051,
  9: 0.046,
};

function CustomTable({ columns, data }) {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data,
      },
      useSortBy
    );

  return (
    <>
      <Table {...getTableProps()}>
        <Thead>
          {headerGroups.map((headerGroup) => (
            <Tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                // Add the sorting props to control sorting. For this example
                // we can add them into the header props
                <Th
                  userSelect="none"
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                >
                  <Flex alignItems="center">
                    {column.render("Header")}
                    {/* Add a sort direction indicator */}
                    {column.isSorted ? (
                      column.isSortedDesc ? (
                        <ChevronDownIcon ml={1} w={4} h={4} />
                      ) : (
                        <ChevronUpIcon ml={1} w={4} h={4} />
                      )
                    ) : (
                      ""
                    )}
                  </Flex>
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>
        <Tbody {...getTableBodyProps()}>
          {rows.length > 0 ? (
            rows.map((row, i) => {
              prepareRow(row);
              return (
                <Tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <Td {...cell.getCellProps()}>{cell.render("Cell")}</Td>
                    );
                  })}
                </Tr>
              );
            })
          ) : (
            <Tr>
              <Td>
                <Skeleton height="25px" width="5vw" />
              </Td>
              <Td>
                <Skeleton height="25px" width="5vw" />
              </Td>
              <Td>
                <Skeleton height="25px" width="5vw" />
              </Td>
              <Td>
                <Skeleton height="25px" width="5vw" />
              </Td>
              <Td>
                <Skeleton height="25px" width="5vw" />
              </Td>
              <Td>
                <Skeleton height="25px" width="5vw" />
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
      <br />
    </>
  );
}

function Topholders() {
  const columns = React.useMemo(
    () => [
      {
        Header: "Holder",
        columns: [
          {
            Header: "Address",
            accessor: "address",
          },
        ],
      },
      {
        Header: "Holdings",
        columns: [
          {
            Header: "Wallet",
            accessor: "wallet",
          },
          {
            Header: "Governance Staking",
            accessor: "governanceStaking",
          },
          {
            Header: "Governance Unclaimed",
            accessor: "governanceUnclaimed",
          },
          {
            Header: "Farming Unclaimed",
            accessor: "farmingUnclaimed",
          },
          {
            Header: "Total",
            accessor: "total",
          },
        ],
      },
    ],
    []
  );
  const [holdersData, setHoldersData] = useState([]);
  const [entriesTotal, setEntriesTotal] = useState(0);
  const [entriesLoaded, setEntriesLoaded] = useState(0);
  const [benfordTotal, setBenfordTotal] = useState(null);
  const [distribution, setDistribution] = useState([]);

  const [totalWallets, setTotalWallets] = useState(0);
  const [totalGovernanceStaked, setTotalGovernanceStaked] = useState(0);
  const [totalGovernanceUnclaimed, setTotalGovernanceUnclaimed] = useState(0);
  const [totalFarmingUnclaimed, setTotalFarmingUnclaied] = useState(0);
  const [totalTotal, setTotalTotal] = useState(0);

  useEffect(() => {
    async function fetchData() {
      let data = await getAllHoldersData(setEntriesLoaded, setEntriesTotal);
      setHoldersData(data);

      setTotalWallets(data.reduce((a, b) => a + (Number(b["wallet"]) || 0), 0));
      setTotalGovernanceStaked(
        data.reduce((a, b) => a + (Number(b["governanceStaking"]) || 0), 0)
      );
      setTotalGovernanceUnclaimed(
        data.reduce((a, b) => a + (Number(b["governanceUnclaimed"]) || 0), 0)
      );
      setTotalFarmingUnclaied(
        data.reduce((a, b) => a + (Number(b["farmingUnclaimed"]) || 0), 0)
      );
      setTotalTotal(data.reduce((a, b) => a + (Number(b["total"]) || 0), 0));

      let totals = data.map((a) => Math.round(Number(a.total)));
      const graphs = new Graphs(totals);
      setBenfordTotal(graphs.getBenfordProbabilities());
      setDistribution(graphs.getDistribution());
    }
    fetchData().catch((error) => alert(error.message));
  }, []);

  const data = React.useMemo(() => holdersData, [holdersData]);

  return (
    <div className="App">
      <Header />
      <Container className="pageContainer" maxW="90vw">
        <Text>
          This page uses on-chain data fetched directly from an Ethereum node
        </Text>
        <Text>Since there is no caching, the response time can be slow.</Text>
        <Text fontSize={24} fontWeight={900}>
          Do not refresh!
        </Text>
        <Progress hasStripe value={(entriesLoaded / entriesTotal) * 100} />
        <Text fontSize={16} fontWeight={700}>
          Loaded {entriesLoaded} of {entriesTotal}
        </Text>
        {/* <StatGroup> */}
        <Grid
          templateRows="repeat(2, auto)"
          templateColumns="repeat(6, 1fr)"
          alignItems="stretch"
          mt="2rem"
        >
          <GridItem row={1} col={1}>
            <Stat>
              <Flex
                boxShadow="base"
                m="2"
                borderWidth="1px"
                borderRadius="lg"
                bg={useColorModeValue("gray.50", "gray.900")}
                flexDirection="column"
              >
                <StatLabel>Total in wallets</StatLabel>
                <StatNumber>
                  {new Intl.NumberFormat().format(totalWallets)}
                </StatNumber>
              </Flex>
            </Stat>
          </GridItem>
          <GridItem row={1} col={2}>
            <Stat>
              <Flex
                boxShadow="base"
                m="2"
                borderWidth="1px"
                borderRadius="lg"
                bg={useColorModeValue("gray.50", "gray.900")}
                flexDirection="column"
              >
                <StatLabel>Total staked in governance</StatLabel>
                <StatNumber>
                  {new Intl.NumberFormat().format(totalGovernanceStaked)}
                </StatNumber>
              </Flex>
            </Stat>
          </GridItem>
          <GridItem row={1} col={3}>
            <Stat>
              <Flex
                boxShadow="base"
                m="2"
                borderWidth="1px"
                borderRadius="lg"
                bg={useColorModeValue("gray.50", "gray.900")}
                flexDirection="column"
              >
                <StatLabel>Total unclaimed in governance</StatLabel>
                <StatNumber>
                  {new Intl.NumberFormat().format(totalGovernanceUnclaimed)}
                </StatNumber>
              </Flex>
            </Stat>
          </GridItem>
          <GridItem row={1} col={4}>
            <Stat>
              <Flex
                boxShadow="base"
                m="2"
                borderWidth="1px"
                borderRadius="lg"
                bg={useColorModeValue("gray.50", "gray.900")}
                flexDirection="column"
              >
                <StatLabel>Total unclaimed in farming</StatLabel>
                <StatNumber>
                  {new Intl.NumberFormat().format(totalFarmingUnclaimed)}
                </StatNumber>
              </Flex>
            </Stat>
          </GridItem>
          <GridItem row={1} col={5}>
            <Stat>
              <Flex
                boxShadow="base"
                m="2"
                borderWidth="1px"
                borderRadius="lg"
                bg={useColorModeValue("gray.50", "gray.900")}
                flexDirection="column"
              >
                <StatLabel>Total tokens</StatLabel>
                <StatNumber>
                  {new Intl.NumberFormat().format(totalTotal)}
                </StatNumber>
              </Flex>
            </Stat>
          </GridItem>
          <GridItem row={1} col={6}>
            <Stat>
              <Flex
                boxShadow="base"
                m="2"
                borderWidth="1px"
                borderRadius="lg"
                bg={useColorModeValue("gray.50", "gray.900")}
                flexDirection="column"
              >
                <StatLabel>Total staked / Total tokens</StatLabel>
                <StatNumber>
                  {new Intl.NumberFormat().format(
                    totalGovernanceStaked / totalTotal
                  )}
                </StatNumber>
              </Flex>
            </Stat>
          </GridItem>
          <GridItem row={2} col={1}>
            <Stat>
              <Flex
                boxShadow="base"
                m="2"
                borderWidth="1px"
                borderRadius="lg"
                bg={useColorModeValue("gray.50", "gray.900")}
                flexDirection="column"
                h="50vh"
              >
                <Text>Benford's Law of totals</Text>

                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    width={500}
                    height={300}
                    data={benfordTotal}
                    margin={{
                      top: 5,
                      right: 20,
                      left: -25,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tick={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="benford" fill="#8884d8" />
                    <Line type="monotone" dataKey="benford" stroke="#8884d8" />
                    <Bar dataKey="actual" fill="#82ca9d" />
                    <Line type="monotone" dataKey="actual" stroke="#82ca9d" />
                  </ComposedChart>
                </ResponsiveContainer>
              </Flex>
            </Stat>
          </GridItem>
          <GridItem row={2} colSpan={5}>
            <Stat>
              <Flex
                boxShadow="base"
                m="2"
                borderWidth="1px"
                borderRadius="lg"
                bg={useColorModeValue("gray.50", "gray.900")}
                flexDirection="column"
                h="50vh"
              >
                <Text>Distribution</Text>

                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    width={500}
                    height={300}
                    data={distribution}
                    margin={{
                      top: 5,
                      right: 20,
                      left: 20,
                      bottom: 25,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tokens">
                      <Label
                        value="Number of tokens"
                        position="bottom"
                        style={{
                          textAnchor: "middle",
                          fill: useColorModeValue("darkgrey", "lightgrey"),
                        }}
                      />
                    </XAxis>
                    <YAxis dataKey="holders">
                      <Label
                        value="Number of holders"
                        angle={270}
                        position="left"
                        style={{
                          textAnchor: "middle",
                          fill: useColorModeValue("darkgrey", "lightgrey"),
                        }}
                      />
                    </YAxis>
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="holders"
                      stroke="#82ca9d"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Flex>
            </Stat>
          </GridItem>
        </Grid>
        {/*  </StatGroup> */}

        <Box
          boxShadow="base"
          mt="1rem"
          w="100%"
          borderWidth="1px"
          borderRadius="lg"
          bg={useColorModeValue("gray.50", "gray.900")}
        >
          <CustomTable columns={columns} data={data} />
        </Box>
      </Container>
      <Footer />
    </div>
  );
}

export default Topholders;

/**
 * A JavaScript basic implementation of the Benford Law
 * @param data an integer array to be used on algorithm
 *
 * #### Usage
 * const citiesPopulation = [12252023, 6718903, 3015268, …, 765]
 * const benford = new Benford(citiesPopulation)
 * benford.printAsTable()
 */

function Graphs(data = []) {
  const benfordProbabilities = {
    1: 0.301,
    2: 0.176,
    3: 0.125,
    4: 0.097,
    5: 0.079,
    6: 0.067,
    7: 0.058,
    8: 0.051,
    9: 0.046,
  };
  const initialDigits = {
    1: { count: 0 },
    2: { count: 0 },
    3: { count: 0 },
    4: { count: 0 },
    5: { count: 0 },
    6: { count: 0 },
    7: { count: 0 },
    8: { count: 0 },
    9: { count: 0 },
  };

  const sanitized = data.filter((e) => e > 0);
  this.sanitizedInput = {
    data: sanitized,
    size: sanitized.length,
  };

  this.digits = sanitized.reduce((acc, number) => {
    const digit = +`${number}`.charAt(0);
    const count = acc[digit].count + 1;
    const percentage = count / sanitized.length;
    const deviation = percentage - benfordProbabilities[digit];

    acc[digit] = { count, percentage, deviation };

    return acc;
  }, initialDigits);

  this.getBenfordProbabilities = () => {
    let data = [];
    for (let pos in benfordProbabilities) {
      data.push({
        benford: benfordProbabilities[pos],
        actual: this.digits[pos].percentage,
      });
    }
    console.log(data);
    return data;
  };

  this.getDistribution = () => {
    let obj = {};

    for (let i = 0; i < this.sanitizedInput.data.length; i++) {
      let element = this.sanitizedInput.data[i];

      element = Math.ceil(element / 10) * 10;

      // if it exists, add 1 to the value
      if (obj[element] !== undefined) {
        obj[element] += 1;
      }

      // if it does not exist, add 1 to setup future elements
      else {
        obj[element] = 1;
      }
    }

    let data = [];
    for (let pos in obj) {
      data.push({ tokens: pos, holders: obj[pos] });
    }

    console.log(data);

    return data;
  };
}
