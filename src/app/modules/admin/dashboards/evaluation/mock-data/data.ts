import {
    IndicatorType,
    Month,
    OperatorType,
    Period,
    Template
} from "../evaluation.types";

export const periods: Period[] = [
    {
        id           : 1,
        dateInit     : 'Enero',
        dateEnd      : 'Marzo'
    },
    {
        id           : 2,
        dateInit     : 'Abril',
        dateEnd      : 'Junio'
    },
    {
        id           : 3,
        dateInit     : 'Julio',
        dateEnd      : 'Septiembre'
    },
    {
        id           : 4,
        dateInit     : 'Octubre',
        dateEnd      : 'Diciembre'
    },
];

export const months: Month[] = [
    {
        id          : 1,
        month       : 'Enero'
    },
    {
        id          : 2,
        month       : 'Febrero'
    },
    {
        id          : 3,
        month       : 'Marzo'
    },
    {
        id          : 4,
        month       : 'Abril'
    },
    {
        id          : 5,
        month       : 'Mayo'
    },
    {
        id          : 6,
        month      : 'Junio'
    },
    {
        id          : 7,
        month       : 'Julio'
    },
    {
        id          : 8,
        month       : 'Agosto'
    },
    {
        id          : 9,
        month       : 'Septiembre'
    },
    {
        id          : 10,
        month       : 'Octubre'
    }, {
        id          : 11,
        month       : 'Noviembre'
    },
    {
        id          : 12,
        month       : 'Diciembre'
    },
];

export const indicatorType: IndicatorType[] = [
    {
        id          : 1,
        type        : 'Ascendente'
    },
    {
        id          : 2,
        type        : 'Descendente'
    }
];

export const operatorsType: OperatorType[] = [
    {
        id              : 1,
        type            : 'Solicitud'
    },
    {
        id              : 2,
        type            : 'Operación'
    }
];

export const templateList: Template[] = [
    {
        id              : 1,
        name            : 'Plantilla Trainee'
    },
    {
        id              : 2,
        name            : 'Plantilla Jr'
    },
    {
        id              : 3,
        name            : 'Plantilla S-Sr'
    },
    {
        id              : 4,
        name            : 'Plantilla Sr'
    }
];