/**
 * Dependence
 */
const axios = require("axios");

module.exports = function (app) {
    const {transports, determination} = app.models
    const leftBottom = {
        lat: 53.228138,
        lon: 58.678196
    }
    const topRight = {
        lat: 56.818680,
        lon: 63.632428
    }
    let interval

    this.addDetermination = async () => {
        console.log('get determination')
        try{
            const {data: response} = await axios.get('https://gis.inf74.ru/GisTransport/GetLastPosition')
            response.map(async (resTransport) => {
                if (resTransport.Lat != null && resTransport.Lng != null) {
                    const coordinates = {
                        lat: resTransport.Lat,
                        lon: resTransport.Lng
                    }

                    // Check for bad data
                    if ((coordinates.lat > leftBottom.lat && coordinates.lat < topRight.lat)
                        && (coordinates.lon > leftBottom.lon && coordinates.lon < topRight.lon)) {

                        // Create determination
                        let transport = await transports.findOne({
                            where: {
                                state_number: resTransport.Znak
                            }
                        })

                        if (transport == null) {
                            transport = await transports.create({
                                state_number: resTransport.Znak,
                                type: resTransport.Type
                            })
                        }

                        await determination.create({
                            transport_id: transport.id,
                            lat: resTransport.Lat,
                            lon: resTransport.Lng,
                            azimuth: resTransport.Azimuth,
                            speed: isNaN(resTransport.Speed) ? 0 : resTransport.Speed,
                            route_number: resTransport.RouteNumber
                        })
                    }
                }
            })

            interval = setTimeout(this.addDetermination, 20000)
        }catch (error){
            console.warn('ERROR UPDATE DETERMINATION', error)
            interval = setTimeout(this.addDetermination, 20000)
        }
    }

    this.clearDeterminationUpdates = async () => {
        console.log('clear determination')
        if (interval) clearTimeout(interval)
    }

    return this
}