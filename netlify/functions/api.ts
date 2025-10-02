import serverless from "serverless-http";

import { createProductionServer } from "../../server";

export const handler = serverless(createProductionServer());
