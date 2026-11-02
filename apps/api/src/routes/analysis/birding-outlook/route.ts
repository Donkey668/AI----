
import { assessBirdingIndex } from "../../../lib/ai/birding-index";
import { createAnalysisOverviewSnapshot } from "../../../../../../packages/shared/src/analysis/analysis-overview";
import { getParkById } from "../../../../../../packages/shared/src/maps/park-options";
import { fetchDistrictWeather } from "../../../lib/weather/amap-weather";
import {
  createFailedResponse,
  createInvalidParkResponse,
  createParkWeatherContext,
  createPartialResponse,
  createSuccessResponse,
} from "../../../../../../packages/shared/src/weather/birding-outlook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestDate = new Date();
  const requestedAt = requestDate.toISOString();
  const parkId = new URL(request.url).searchParams.get("parkId")?.trim();

  if (!parkId) {
    return Response.json(createInvalidParkResponse(requestedAt), {
      status: 400,
    });
  }

  const park = getParkById(parkId);
  if (!park) {
    return Response.json(createInvalidParkResponse(requestedAt), {
      status: 400,
    });
  }

  const parkContext = createParkWeatherContext(park);
  const weatherResult = await fetchDistrictWeather(parkContext);

  if (!weatherResult.ok) {
    return Response.json(
      createFailedResponse(requestedAt, parkContext, weatherResult.message),
      {
        status: 502,
      },
    );
  }

  const birdingIndex = await assessBirdingIndex(weatherResult.data);
  if (birdingIndex.status === "success") {
    const analysisOverview = createAnalysisOverviewSnapshot(
      birdingIndex,
      requestDate,
    );

    return Response.json(
      createSuccessResponse(
        requestedAt,
        parkContext,
        weatherResult.data,
        birdingIndex,
        analysisOverview,
      ),
    );
  }

  const analysisOverview = createAnalysisOverviewSnapshot(
    birdingIndex,
    requestDate,
  );

  return Response.json(
    createPartialResponse(
      requestedAt,
      parkContext,
      weatherResult.data,
      birdingIndex,
      analysisOverview,
    ),
  );
}
