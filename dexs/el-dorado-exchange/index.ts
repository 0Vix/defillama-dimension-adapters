import request, { gql } from "graphql-request";
import { Fetch, SimpleAdapter } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";
import { getUniqStartOfTodayTimestamp } from "../../helpers/getUniSubgraphVolume";

const endpoints: { [key: string]: string } = {
  [CHAIN.BSC]: "https://api.thegraph.com/subgraphs/name/aaronlux/ede-stats",
  [CHAIN.ARBITRUM]: "https://api.thegraph.com/subgraphs/name/metaverseblock/ede_state_elp1_arbitrimone",
}

const historicalDataSwap = gql`
  query get_volume($period: String!, $id: String!) {
    volumeStats(where: {period: $period, id: $id}) {
        swap
      }
  }
`

interface IGraphResponse {
  volumeStats: Array<{
    burn: string,
    liquidation: string,
    margin: string,
    mint: string,
    swap: string,
  }>
}

const getFetch = (query: string)=> (chain: string): Fetch => async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date((timestamp * 1000)))
  const dailyData: IGraphResponse = await request(endpoints[chain], query, {
    id: String(dayTimestamp),
    period: 'daily',
  })
  const totalData: IGraphResponse = await request(endpoints[chain], query, {
    id: 'total',
    period: 'total',
  })

  return {
    timestamp: dayTimestamp,
    dailyVolume:
      dailyData.volumeStats.length == 1
        ? String(Number(Object.values(dailyData.volumeStats[0]).reduce((sum, element) => String(Number(sum) + Number(element)))) * 10 ** -30)
        : undefined,
    totalVolume:
      totalData.volumeStats.length == 1
        ? String(Number(Object.values(totalData.volumeStats[0]).reduce((sum, element) => String(Number(sum) + Number(element)))) * 10 ** -30)
        : undefined,

  }
}

const getStartTimestamp = async (chain: string) => {
  const startTimestamps: { [chain: string]: number } = {
    [CHAIN.BSC]: 1670198400,
    [CHAIN.ARBITRUM]: 1678118400,
  }
  return startTimestamps[chain]
}


const adapter: SimpleAdapter = {
  adapter: {
    [CHAIN.BSC]: {
      fetch: getFetch(historicalDataSwap)(CHAIN.BSC),
      start: async () => getStartTimestamp(CHAIN.BSC),
    },
    [CHAIN.ARBITRUM]: {
      fetch: getFetch(historicalDataSwap)(CHAIN.ARBITRUM),
      start: async () => getStartTimestamp(CHAIN.ARBITRUM),
    }
  },
};

export default adapter;
