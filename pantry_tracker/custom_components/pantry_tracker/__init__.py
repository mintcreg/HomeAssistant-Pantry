from homeassistant.helpers import entity_platform
from .const import DOMAIN

async def async_setup(hass, config):
    """Set up the Pantry Tracker component."""
    hass.data[DOMAIN] = {}
    platform = entity_platform.async_get_current_platform()
    platform.async_register_entity_service(
        'set_item',
        {
            'entity_id': str,
            'state': str,
            'attributes': dict,
        },
        'async_set_item',
    )
    return True
