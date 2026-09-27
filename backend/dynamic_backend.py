import random
import math
from datetime import datetime, timezone
from typing import Dict, List, Any

import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor

app = FastAPI(title="NEXORA Dynamic Event Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GATES = ["A", "B", "C", "D"]
RESTAURANTS = [
    {"name": "The Food Court", "zone": "Zone A"},
    {"name": "Spice Route", "zone": "Gate C"},
    {"name": "Green Bowl", "zone": "Concourse"},
    {"name": "Sky Lounge", "zone": "Upper Terrace"},
]
ROUTES = {
    "Dombivli": {"Hotel A": "Route 12", "Hotel B": "Route 17"},
    "Nerul": {"Hotel A": "Gate C", "Hotel B": "Gate A"},
    "Panvel": {"Hotel A": "Route 9", "Hotel B": "Route 17"},
}


class OptimizationEngine:
    def __init__(self):
        self.gate_model = self._train_gate_model()
        self.food_model = self._train_food_model()

    def _train_gate_model(self):
        rows = []
        for hour in range(12, 24):
            for weather_score in [0, 1, 2, 3]:
                for gate in GATES:
                    base = 54 + (hour - 12) * 2.1 + weather_score * 8
                    gate_bias = {"A": 0, "B": 12, "C": -7, "D": 5}[gate]
                    noise = random.Random(hash((hour, weather_score, gate)) % 10**9).randint(-10, 16)
                    rows.append({
                        "hour": hour,
                        "weather_score": weather_score,
                        "gate": gate,
                        "crowd_pct": max(18, min(98, round(base + gate_bias + noise))),
                    })

        df = pd.DataFrame(rows)
        df["gate_code"] = df["gate"].astype("category").cat.codes
        model = XGBRegressor(
            n_estimators=220,
            max_depth=4,
            learning_rate=0.08,
            objective="reg:squarederror",
            random_state=42,
        )
        model.fit(df[["hour", "weather_score", "gate_code"]], df["crowd_pct"])
        return model

    def _train_food_model(self):
        rows = []
        for hour in range(12, 24):
            for restaurant in RESTAURANTS:
                for weather_score in [0, 1, 2, 3]:
                    base = 8 + (hour - 12) * 1.3 + weather_score * 3
                    noise = random.Random(hash((hour, restaurant["name"], weather_score)) % 10**9).randint(-4, 8)
                    rows.append({
                        "hour": hour,
                        "weather_score": weather_score,
                        "restaurant": restaurant["name"],
                        "wait_min": max(4, min(35, round(base + noise))),
                    })

        df = pd.DataFrame(rows)
        df["restaurant_code"] = df["restaurant"].astype("category").cat.codes
        model = RandomForestRegressor(n_estimators=200, random_state=42)
        model.fit(df[["hour", "weather_score", "restaurant_code"]], df["wait_min"])
        return model

    def _weather_score(self) -> int:
        current = datetime.now(timezone.utc)
        minute_phase = (current.hour * 60 + current.minute) % 360
        if 15 <= minute_phase <= 120:
            return 1
        if 120 < minute_phase <= 220:
            return 2
        return 3

    def _gate_code(self, gate: str) -> int:
        return {"A": 0, "B": 1, "C": 2, "D": 3}[gate]

    def _restaurant_code(self, restaurant: str) -> int:
        return {name: i for i, name in enumerate([row["name"] for row in RESTAURANTS])}[restaurant]

    def predict_gate_load(self, gate: str) -> int:
        hour = datetime.now().hour
        weather = self._weather_score()
        prediction = self.gate_model.predict(pd.DataFrame([{
            "hour": hour,
            "weather_score": weather,
            "gate_code": self._gate_code(gate),
        }]))[0]
        return int(max(18, min(98, round(prediction))))

    def predict_wait(self, restaurant_name: str) -> int:
        hour = datetime.now().hour
        weather = self._weather_score()
        prediction = self.food_model.predict(pd.DataFrame([{
            "hour": hour,
            "weather_score": weather,
            "restaurant_code": self._restaurant_code(restaurant_name),
        }]))[0]
        return int(max(4, min(35, round(prediction))))

    def best_gate(self) -> Dict[str, Any]:
        per_gate = {gate: self.predict_gate_load(gate) for gate in GATES}
        best_gate = min(per_gate, key=per_gate.get)
        return {
            "gate": best_gate,
            "crowd_pct": per_gate[best_gate],
            "all_gates": per_gate,
            "confidence": round(0.88 + (100 - per_gate[best_gate]) / 1000, 3),
        }

    def best_route(self, origin: str = "Dombivli", destination: str = "Hotel A") -> Dict[str, Any]:
        route_path = ROUTES.get(origin, {}).get(destination, "Route 12")
        congestion = {"Route 12": 58, "Route 17": 67, "Gate C": 61, "Gate A": 55, "Route 9": 52}
        best_route = min(congestion, key=congestion.get)
        return {
            "origin": origin,
            "destination": destination,
            "recommended_path": best_route,
            "route_plan": [origin, route_path, destination],
            "route_load": congestion.get(best_route, 60),
            "confidence": 0.9,
        }


engine = OptimizationEngine()


def build_forecast(gates: Dict[str, int]) -> List[Dict[str, str]]:
    return [
        {"label": "+15 min", "level": "Moderate" if gates["B"] > 70 else "Light", "detail": f"Gate B {gates['B']}%"},
        {"label": "+30 min", "level": "High" if gates["B"] > 82 else "Moderate", "detail": f"Gate C {gates['C']}%"},
        {"label": "+60 min", "level": "High" if max(gates.values()) > 86 else "Moderate", "detail": f"Peak queue near Gate {max(gates, key=gates.get)}"},
    ]


def build_restaurants() -> List[Dict[str, Any]]:
    results = []
    for item in RESTAURANTS:
        wait = engine.predict_wait(item["name"])
        results.append({
            "name": item["name"],
            "wait": f"{wait} min",
            "capacity": f"{max(25, min(95, 100 - wait))}%",
            "type": "Food & Beverage",
            "updatedAt": "just now",
            "stallStatus": "OPEN" if wait < 20 else "BUSY",
            "address": f"{item['zone']}, D.Y. Patil Stadium, Navi Mumbai",
            "lat": 19.0185 + random.random() * 0.003,
            "lng": 73.0320 + random.random() * 0.003,
            "mapsUrl": "https://www.google.com/maps/search/?api=1&query=19.0185,73.0320",
        })
    return results


def build_live_updates(best_gate: Dict[str, Any], route_plan: Dict[str, Any]) -> List[Dict[str, str]]:
    return [
        {"id": "u1", "tone": "green", "title": "Best gate for you", "meta": f"Recommended gate is {best_gate['gate']} with {best_gate['crowd_pct']}% crowd load", "time": "just now"},
        {"id": "u2", "tone": "blue", "title": "Route optimization", "meta": f"Best flow is {route_plan['recommended_path']} from {route_plan['origin']} to {route_plan['destination']}", "time": "just now"},
        {"id": "u3", "tone": "amber", "title": "Crowd watch", "meta": "Gate B remains the busiest corridor over the next 30 minutes.", "time": "just now"},
    ]


def build_recommendations(best_gate: Dict[str, Any]) -> List[Dict[str, Any]]:
    return [
        {
            "id": "rec-dynamic-1",
            "title": "Redirect next wave to the best gate",
            "reason": f"Move the next 700 attendees toward Gate {best_gate['gate']} to keep crowds balanced.",
            "impact": "High impact",
            "type": "redirect",
            "payload": {"from": "B", "to": best_gate["gate"], "amount": 18},
            "status": "pending",
        },
        {
            "id": "rec-dynamic-2",
            "title": "Refresh food counters",
            "reason": "Queue pressure is rising near the main concourse and restaurant waits are trending above target.",
            "impact": "Medium impact",
            "type": "food",
            "status": "pending",
        },
    ]


@app.get("/api/health")
def health():
    return {
        "ok": True,
        "service": "nexora-dynamic-backend",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/dashboard")
def dashboard():
    gate_loads = {gate: engine.predict_gate_load(gate) for gate in GATES}
    total = sum(gate_loads.values())
    utilization = round((sum(gate_loads.values()) / (len(GATES) * 100)) * 100)
    best_gate = engine.best_gate()
    route_plan = engine.best_route()

    payload = {
        "crowd": {
            "total": total,
            "utilization": utilization,
            "gates": gate_loads,
            "forecast": build_forecast(gate_loads),
        },
        "hotels": [
            {"name": "Sunset Grand Hotel", "rooms": 12, "rating": 4.6, "address": "Sector 7, Nerul, Navi Mumbai"},
            {"name": "Navi Mumbai Suites", "rooms": 9, "rating": 4.3, "address": "Palm Beach Road, Navi Mumbai"},
        ],
        "restaurants": build_restaurants(),
        "liveUpdates": build_live_updates(best_gate, route_plan),
        "recommendations": build_recommendations(best_gate),
        "optimization": {
            "best_gate": best_gate,
            "best_route": route_plan,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        },
        "event": {
            "name": "COLDPLAY · MUSIC OF THE SPHERES",
            "date": "18 Jan 2026",
            "time": "6:00 PM onwards",
            "venue": "D.Y. Patil Stadium · Navi Mumbai",
            "attendees": 58420,
        },
    }
    return payload


@app.get("/api/predict")
def predict(gate: str = "B", restaurant: str = "The Food Court"):
    return {
        "gate_prediction": {"gate": gate, "crowd_pct": engine.predict_gate_load(gate)},
        "restaurant_prediction": {"restaurant": restaurant, "wait_min": engine.predict_wait(restaurant)},
        "optimization": engine.best_gate(),
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/route-plan")
def route_plan(origin: str = "Dombivli", destination: str = "Hotel A"):
    return engine.best_route(origin=origin, destination=destination)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("dynamic_backend:app", host="0.0.0.0", port=8200, reload=True)
