def calculate_price(price_per_night: float, nights: int) -> dict:
    nightly_total = round(price_per_night * nights, 2)
    cleaning_fee = round(price_per_night * 0.10, 2)
    service_fee = round(nightly_total * 0.12, 2)
    tax = round(nightly_total * 0.08, 2)
    total = round(nightly_total + cleaning_fee + service_fee + tax, 2)

    return {
        "nightly_price": price_per_night,
        "nights": nights,
        "nightly_total": nightly_total,
        "cleaning_fee": cleaning_fee,
        "service_fee": service_fee,
        "tax": tax,
        "total": total,
    }
