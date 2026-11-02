
import { getParkById } from "../../../../../../packages/shared/src/maps/park-options";
import { createParkWeatherContext } from "../../../../../../packages/shared/src/weather/birding-outlook";
import {
  createFailedForecastWarningResponse,
  createForecastWarningResponse,
  createInvalidForecastWarningResponse,
  fetchForecastWarningModules,
} from "../../../lib/weather/sz-forecast-warning";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestedAt = new Date().toISOString();
  const parkId = new URL(request.url).searchParams.get("parkId")?.trim();

  if (!parkId) {
    return Response.json(createInvalidForecastWarningResponse(requestedAt), {
      status: 400,
    });
  }

  const park = getParkById(parkId);
  if (!park) {
    return Response.json(createInvalidForecastWarningResponse(requestedAt), {
      status: 400,
    });
  }

  const parkContext = createParkWeatherContext(park);

  try {
    const modules = await fetchForecastWarningModules(parkContext);
    const response = createForecastWarningResponse(requestedAt, parkContext, modules);

    if (response.requestStatus === "failed") {
      return Response.json(response, { status: 502 });
    }

    return Response.json(response);
  } catch {
    return Response.json(
      createFailedForecastWarningResponse(requestedAt, parkContext),
      {
        status: 502,
      },
    );
  }
}
