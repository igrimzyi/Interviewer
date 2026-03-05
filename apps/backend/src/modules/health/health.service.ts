export type HealthStatus = {
  status: "ok";
  uptimeSeconds: number;
  timestamp: string;
};

export class HealthService {
  getStatus(): HealthStatus {
    return {
      status: "ok",
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
