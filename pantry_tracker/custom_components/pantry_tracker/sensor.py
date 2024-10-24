import logging
from homeassistant.helpers.entity import Entity

_LOGGER = logging.getLogger(__name__)

def setup_platform(hass, config, add_entities, discovery_info=None):
    # Initialize sensors for categories and products
    add_entities([PantryCategorySensor(), PantryProductSensor()])

class PantryCategorySensor(Entity):
    def __init__(self):
        self._state = None

    @property
    def name(self):
        return "Pantry Categories"

    @property
    def state(self):
        return self._state

class PantryProductSensor(Entity):
    def __init__(self):
        self._state = None

    @property
    def name(self):
        return "Pantry Products"

    @property
    def state(self):
        return self._state
