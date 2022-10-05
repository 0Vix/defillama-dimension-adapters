import { Chain } from "@defillama/sdk/build/general";
import { SimpleAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";

const {
  getChainVolume,
} = require("../../helper/getUniSubgraphVolume");
const endpoints = {
  [CHAIN.IOTEX]: "https://graph-cache.mimo.exchange/subgraphs/name/mimo/mainnet"
};

const graphs = getChainVolume({
  graphUrls: endpoints,
  totalVolume: {
    factory: "uniswapFactories",
    field: "totalVolumeUSD",
  },
  dailyVolume: {
    factory: "uniswapDayData",
    field: "dailyVolumeUSD",
    dateField: "date"
  }
});


const adapter: SimpleAdapter = {
  volume: Object.keys(endpoints).reduce((acc, chain: any) => {
    return {
      ...acc,
      [chain]: {
        fetch: graphs(chain as Chain),
        start: async () => 1624332218
      }
    }
  }, {})
};

export default adapter;
