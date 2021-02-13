Object.defineProperty(Date.prototype, 'YYYYMMDDHH', {
    value: function() {
        function pad2(n) {  // always returns a string
            return (n < 10 ? '0' : '') + n;
        }
  
        return this.getFullYear() +
               pad2(this.getMonth() + 1) + 
               pad2(this.getDate()) +
               pad2(this.getHours())
    }
  });

exports.array_of_obj_to_obj = function(array, key) {
    let obj = {};
    for (let el of array) {
        obj[el[key]] = el;
    }
    return obj;
}

exports.hours_from_now = function(hours) {
    let d = new Date();
    d.setHours(d.getHours() + hours);
    return d;
}

exports.coord_calc = function(step, total_steps, x1, y1, x2, y2) {
    last_x = x1 + ((step-1) * ((x2 - x1) / total_steps));
    last_y = y1 + ((step-1) * ((y2 - y1) / total_steps));
    this_x = x1 + (step * ((x2 - x1) / total_steps));
    this_y = y1 + (step * ((y2 - y1) / total_steps));

    let angleInRadians = 0;
    if (this_x != last_x) {
        angleInRadians = Math.PI/2 - Math.atan((-1*(this_y - last_y)) / (this_x - last_x));
    }

    return {
        x: this_x,
        y: this_y,
        angleInRadians: angleInRadians
    }
}