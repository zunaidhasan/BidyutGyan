"""BidyutGyan (বিদ্যুতজ্ঞান) — Application Configuration."""

from dataclasses import dataclass, field
from pathlib import Path
import json
import os


@dataclass
class Settings:
    # App info
    app_name: str = "BidyutGyan (বিদ্যুতজ্ঞান)"
    app_version: str = "1.0.0"
    app_description: str = "Load shedding schedule & electricity utility information for Bangladesh."

    # Paths
    base_dir: Path = field(default_factory=lambda: Path(__file__).resolve().parent.parent)
    data_dir: Path = field(default_factory=lambda: Path(__file__).resolve().parent / "data")

    # Data files
    utilities_json: str = "bangladesh_utilities.json"

    # Server
    host: str = os.getenv("APP_HOST", "0.0.0.0")
    port: int = int(os.getenv("APP_PORT", "8000"))
    log_level: str = os.getenv("LOG_LEVEL", "info")

    # Demo mode (no external APIs needed)
    demo_mode: bool = os.getenv("DEMO_MODE", "true").lower() == "true"

    @property
    def utilities_path(self) -> Path:
        return self.data_dir / self.utilities_json

    def load_utilities_data(self) -> dict:
        """Load the utilities mapping JSON file."""
        path = self.utilities_path
        if not path.exists():
            raise FileNotFoundError(f"Utilities data file not found: {path}")
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)


# Global singleton
settings = Settings()
