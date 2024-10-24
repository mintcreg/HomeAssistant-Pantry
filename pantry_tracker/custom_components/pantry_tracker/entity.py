from homeassistant.helpers.entity import Entity
from .const import DOMAIN

async def async_setup_platform(hass, config, async_add_entities, discovery_info=None):
    """Set up the Pantry Tracker entities."""
    entities = hass.data[DOMAIN].get('entities', [])
    async_add_entities(entities)

class PantryItem(Entity):
    def __init__(self, entity_id, state, attributes):
        self.entity_id = entity_id
        self._state = state
        self._attributes = attributes

    @property
    def name(self):
        return self._attributes.get('friendly_name', self.entity_id)

    @property
    def state(self):
        return self._state

    @property
    def extra_state_attributes(self):
        return self._attributes

    async def async_set_item(self, **kwargs):
        self._state = kwargs.get('state', self._state)
        self._attributes.update(kwargs.get('attributes', {}))
        self.async_write_ha_state()
