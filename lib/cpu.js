// example = "55 16 37 92 00 30 01 00 00 00 00 00 00 00 00 00";
var cpu = {

	step: function () {
		function setState(nextState, stageName, description) {

			description = description.replace(/\*(.*?)\*/g, function (match, contents) {
				return '<span class="hint_name">' + contents + '</span>';
			});
			cpu.showHint('<span class="fetch_decode_execute ' + stageName.toLowerCase() + '">' + stageName + '</span>' + description);
			cpu.state = nextState;
		}
		switch (cpu.state) {

			case 0:
				setState(1, "Fetch", "The *Control Unit* copies the value in the *Program Counter* register to the *Memory Address Register* and onto the *Address Bus*");
				cpu.registers.mar = cpu.registers.pc;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_pc,#reg_mar').addClass('active');
				$('.current_instruction').removeClass('current_instruction');
				$('#ram_address_' + cpu.registers.pc).addClass('current_instruction');
				break;
			case 1:
				setState(2, "Fetch", "The *Control Unit* tells the memory store to look at the address on the *Address Bus* and load the value stored there onto the *Data Bus*");
				$('.active').removeClass('active');
				$('#ram_value_' + cpu.registers.mar).addClass('active');
				break;

			case 2:
				setState(3, "Fetch", "The *Control Unit* stores the value on the *Data Bus* into the *Memory Data Register*");
				cpu.registers.mbr = cpu.ram[cpu.registers.mar];
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_mbr').addClass('active');
				break;

			case 3:
				setState(4, "Fetch", "The *Control Unit* copies the value from the *Memory Data Register* into the *Current Instruction Register*");
				cpu.registers.ir = cpu.registers.mbr;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_mbr,#reg_ir').addClass('active');
				break;

			case 4:
				setState(5, "Fetch", "The *Control Unit* increments the *Program Counter*");
				cpu.registers.pc++;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_pc').addClass('active');
				break;


			case 5:
				setState(6, "Decode", "The *Decode Unit* breaks the value in the *Current Instruction Register* into the *opcode* and *operand*.");
				$('.active').removeClass('active');
				$('#reg_ir,.decode_unit table').addClass('active');
				break;

			case 6:
				const opcode = ((cpu.registers.ir & 0xffff) >> 4);
				$('.active').removeClass('active');
				$('.decode_row_' + opcode).addClass('active');
				console.log(opcode);
				switch (opcode) {
					case 0:
						setState(7, "Decode", "The *opcode* 0000 means end the program");
						break;

					case 1:
						setState(8, "Decode", "The *opcode* 0001 means add the value in the *acumulator* register to the data stored in memory at the address specified by the *operand*");
						break;

					case 2:
						setState(9, "Decode", "The *opcode* 0010 means subtract the value stored in memory at the address specified by the *operand* from the value in the *acumulator* register");
						break;

					case 3:
						setState(10, "Decode", "The *opcode* 0011 means store the value in the *acumulator* register into memory at the address specified by the *operand*");
						break;
					case 4:
						setState(16, "Decode", "The *opcode* 0100 means mult the value stored in memory at the address specified by the *operand* from the value in the *acumulator* register");
						break;

					case 5:
						setState(11, "Decode", "The *opcode* 0101 means load the value from memory (at the address specified by the *operand*) into the *acumulator* register");
						break;

					case 6:
						setState(12, "Decode", "The *opcode* 0110 means branch (unconditionally)");
						break;

					case 7:
						setState(13, "Decode", "The *opcode* 0111 means branch if the *acumulator* stores a value equal to 0");
						break;

					case 8:
						setState(14, "Decode", "The *opcode* 1000 means branch if the *acumulator* stores a value greater or equal to 0 (not negative)");
						break;

					case 9:
						setState(15, "Decode", "The *opcode* 1001 means either input or output, depending on the *operand*");
						break;
					case 10:
						setState(17, "Decode", "The *opcode* 1010 means multiply the value in the *acumulator* register by the data stored in memory at the address specified by the *operand*");
						break;



				}
				break;

			case 7:
				setState(7, "Execute", "The CPU has halted so the *Control Unit* doesn't fetch any more instructions");
				$('.active').removeClass('active');
				cpu.running = false;
				break;

			case 8: //The *opcode* 0001 means add the value in the *acumulator* register to the data stored in memory at the address specified by the *operand*"
				setState(81, "Decode", "The *Decode Unit* sends the *opcode* to the *Memory Address Register* which gets copied onto the *Address Bus*");
				cpu.registers.mar = cpu.registers.ir & 0x0F;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_mar,.decode_row_1').addClass('active');
				break;
			case 81:
				setState(82, "Execute", "The *Control Unit* tells the memory store to look at the address on the *Address Bus* and place that value on the *Data Bus*");
				$('.active').removeClass('active');
				$('#ram_value_' + cpu.registers.mar).addClass('active');
				break;
			case 82:
				setState(83, "Execute", "The *Control Unit* copies the value on the *Data Bus* into the *Memory Data Register*");
				cpu.registers.mbr = cpu.ram[cpu.registers.mar];
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_mbr').addClass('active');
				break;
			case 83:
				setState(0, "Execute", "The *opcode* and *Control Unit* signals the *Arithmetic Logic Unit* to add the values stored in the *acumulator* and *Memory Data Register*s. The result gets saved back in the *acumulator* register.");
				cpu.registers.ac += cpu.registers.mbr;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_mbr,#alu,#ac').addClass('active');
				break;


			case 9: //"The *opcode* 0010 means subtract the value stored in memory at the address specified by the *operand* from the value in the *acumulator* register"
				setState(91, "Decode", "The *Decode Unit* sends the *opcode* to the *Memory Address Register* which gets copied onto the *Address Bus*");
				cpu.registers.mar = cpu.registers.ir & 0x0F;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_mar').addClass('active');
				break;

			case 91:
				setState(92, "Execute", "The *Control Unit* tells the memory store to look at the address on the *Address Bus* and place that value on the *Data Bus*");
				$('.active').removeClass('active');
				$('#ram_value_' + cpu.registers.mar).addClass('active');
				break;
			case 92:
				setState(93, "Execute", "The *Control Unit* copies the value on the *Data Bus* into the *Memory Data Register*");
				$('.active').removeClass('active');
				$('#reg_mbr').addClass('active');
				cpu.registers.mbr = cpu.ram[cpu.registers.mar];
				cpu.updateValues();
				break;
			case 93:
				setState(0, "Execute", "The *opcode* and *Control Unit* signals the *Arithmetic Logic Unit* to subtract the values stored in the *Memory Data Register* from the value stored in the *acumulator* register. The result gets saved back in the *acumulator* register.");
				cpu.registers.ac = cpu.registers.mbr - cpu.registers.ac;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#alu,#reg_ac,#reg_mbr').addClass('active');
				break;



			case 10: //"The *opcode* 0011 means store the value in the *acumulator* register into memory at the address specified by the *operand*"
				setState(101, "Decode", "The *opcode* and *Control Unit* sends the value stored in the *acumulator* register to the *Memory Data Register* which gets copied on to the *Data Bus*");
				cpu.registers.mbr = cpu.registers.ac;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_ac,#reg_mbr').addClass('active');
				break;
			case 101:
				setState(102, "Decode", "The *Decode Unit* sends the *operand* to the *Memory Address Register* which gets copied onto the *Address Bus*");
				cpu.registers.mar = cpu.registers.ir & 0x0F;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_mar').addClass('active');
				break;
			case 102:
				setState(0, "Execute", "The *Control Unit* tells the memory store to store the value on the *Data Bus* into the address on the *Address Bus*");
				cpu.ram[cpu.registers.mar] = cpu.registers.mbr;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#ram_value_' + cpu.registers.mar).addClass('active');
				break;

			case 11: //"The *opcode* 0101 means load the value from memory (at the address specified by the *operand*) into the *acumulator* register"
				setState(111, "Decode", "The *Decode Unit* sends the *operand* to the *Memory Address Register* which gets copied onto the *Address Bus*");
				cpu.registers.mar = cpu.registers.ir & 0x0F;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_mar').addClass('active');
				break;

			case 111:
				setState(112, "Execute", "The *Control Unit* tells the memory store to look at the address on the *Address Bus* and place that value on the *Data Bus*");
				$('.active').removeClass('active');
				$('#ram_value_' + cpu.registers.mar).addClass('active');
				break;
			case 112:
				setState(113, "Execute", "The *Control Unit* copies the value on the *Data Bus* into the *Memory Data Register*");
				cpu.registers.mbr = cpu.ram[cpu.registers.mar];
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_mbr').addClass('active');
				break;
			case 113:
				setState(20, "Execute", "The *opcode* and *Control Unit* sends the value in the *Memory Data Register* to the *acumulator* register.");
				cpu.registers.ac = cpu.registers.mbr;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_mbr,#reg_ac').addClass('active');
				break;

			case 12://The *opcode* 0110 means branch (unconditionally)
				setState(20, "Execute", "The *operand* gets stored in the *Program Counter*");
				cpu.registers.pc = cpu.registers.ir & 0x0F;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_pc').addClass('active');
				break;

			case 13://The *opcode* 0111 means branch if the *acumulator* stores a value equal to 0
				setState(20, "Execute", "The *Control Unit* and *opcode* makes the *Arithmetic Logic Unit* check to see if the *acumulator* register contains a zero. If it does, the *operand* gets copied into the *Program Counter* register");
				if (cpu.registers.ac == 0)
					cpu.registers.pc = cpu.registers.ir & 0x0F;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_ac,#reg_pc,#alu').addClass('active');
				break;

			case 14://The *opcode* 1000 means branch if the *acumulator* stores a value greater than or equal to 0"
				setState(20, "Execute", "The *Control Unit* and *opcode* makes the *Arithmetic Logic Unit* check to see if the *acumulator* register contains a value greater than zero. If it does, the *operand* gets copied into the *Program Counter* register");
				if (cpu.registers.ac >= 0)
					cpu.registers.pc = cpu.registers.ir & 0x0FFFF;
				$('.active').removeClass('active');
				cpu.updateValues();
				$('#alu,#reg_ac,#reg_pc').addClass('active');
				break;

			case 15://The *opcode* 1001 means either input or output, depending on the *operand*"
				if ((cpu.registers.ir & 0x0F) == 1) {
					setState(20, "Execute", "The *opcode* 0001 and the *Control Bus* reads from the input device and places the input value into the *acumulator* register");
					/*cpu.registers.ac = parseInt(prompt("Ingrese un numero decimal:")) & 0xFFFF;
					cpu.updateValues();
					$('.active').removeClass('active');
					$('#reg_ac').addClass('active');*/
					(async () => {
						const result = await Swal.fire({
							title: 'Ingrese un número decimal:',
							input: 'text',
							showCancelButton: true,
							confirmButtonText: 'Aceptar',
							cancelButtonText: 'Cancelar',
						});
						if (result.isConfirmed) {
							const inputValue = result.value;
							if (!isNaN(inputValue)) {
								cpu.registers.ac = parseInt(inputValue) & 0xFFFF;
								Swal.fire('Número ingresado correctamente!', '', 'success');
							} else {
								Swal.fire('Error', 'Por favor, ingrese un número válido.', 'error');
							}
						}
						cpu.updateValues();
						$('.active').removeClass('active');
						$('#reg_ac').addClass('active');
					})();
				}


				if ((cpu.registers.ir & 0x0F) == 2) {
					setState(20, "Execute", "The *opcode* 0010 and the *Control Bus* causes the value of the *acumulator* register to be sent to the output device");

					//alert("Output: " + cpu.registers.ac);
					Swal.fire({
						title: 'Output',
						text: cpu.registers.ac,
						icon: 'info', // Puedes cambiar 'info' por otros valores como 'success', 'warning', 'error', etc.
						confirmButtonText: 'OK'
					});

					$('.active').removeClass('active');
					$('#reg_ac').addClass('active');

				}
				break;

			case 16://The *opcode* 1101 means multiply the value in the *acumulator* register by the data stored in memory at the address specified by the *operand*"
				setState(161, "Decode", "The *Decode Unit* sends the *opcode* to the *Memory Address Register* which gets copied onto the *Address Bus*");
				cpu.registers.mar = cpu.registers.ir & 0x0F;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_mar,.decode_row_4').addClass('active');
				break;
			case 161:
				//setState(162, "Execute", "The *Control Unit* copies the value on the *Data Bus* into the *Memory Data Register*");
				setState(162, "Execute", "The *Control Unit* tells the memory store to look at the address on the *Address Bus* and place that value on the *Data Bus*");
				$('.active').removeClass('active');
				$('#ram_value_' + cpu.registers.mar).addClass('active');
				break;
			case 162:
				setState(163, "Execute", "The *Control Unit* copies the value on the *Data Bus* into the *Memory Data Register*");
				$('.active').removeClass('active');
				$('#reg_mbr').addClass('active');
				cpu.registers.mbr = cpu.ram[cpu.registers.mar];
				cpu.updateValues();
				break;
			case 163:
				setState(0, "Execute", "The *opcode* and *Control Unit* signals the *Arithmetic Logic Unit* to multiply the values stored in the *acumulator* and *Memory Data Register*s. The result gets saved back in the *acumulator* register.");
				cpu.registers.ac = cpu.registers.ac * cpu.registers.mbr;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#alu,#reg_ac,#reg_mbr').addClass('active');
				break;

			case 17://The *opcode* 1101 means multiply the value in the *acumulator* register by the data stored in memory at the address specified by the *operand*"
				setState(171, "Decode", "The *Decode Unit* sends the *opcode* to the *Memory Address Register* which gets copied onto the *Address Bus*");
				cpu.registers.mar = cpu.registers.ir & 0x0F;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_mar,.decode_row_10').addClass('active');
				break;
			case 171:
				//setState(162, "Execute", "The *Control Unit* copies the value on the *Data Bus* into the *Memory Data Register*");
				setState(172, "Execute", "The *Control Unit* tells the memory store to look at the address on the *Address Bus* and place that value on the *Data Bus*");
				$('.active').removeClass('active');
				$('#ram_value_' + cpu.registers.mar).addClass('active');
				break;
			case 172:
				setState(173, "Execute", "The *Control Unit* copies the value on the *Data Bus* into the *Memory Data Register*");
				$('.active').removeClass('active');
				$('#reg_mbr').addClass('active');
				cpu.registers.mbr = cpu.ram[cpu.registers.mar];
				cpu.updateValues();
				break;
			case 173:
				setState(0, "Execute", "The *opcode* and *Control Unit* signals the *Arithmetic Logic Unit* to multiply the values stored in the *acumulator* and *Memory Data Register*s. The result gets saved back in the *acumulator* register.");

				cpu.registers.ac = cpu.registers.mbr / cpu.registers.ac;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#alu,#reg_ac,#reg_mbr').addClass('active');
				break;



			case 20:
				setState(0, "Execute", "The *Control Unit* checks for interrupts and either branches to the relevant interrupt service routine or starts the cycle again.");
				break;


		}
		if (cpu.running) {
			cpu.nextTimeout = setTimeout(cpu.step, cpu.runDelay);
		}
	},

	state: 0,

	running: false,

	nextTimeout: 0,

	runDelay: 1000,

	showHint: function (html) {
		$('#hint_text').html(html);
	},

	jqCPU: null,

	ram: [],

	pad: function (val, length) {
		while (val.length < length) {
			val = "0" + val;
		}
		return val;
	},

	hex2bin: function (hex) {
		var v = parseInt(hex, 16) & 0xFFFF;
		return cpu.pad(v.toString(2), 16);
	},

	bin2hex: function (bin) {
		var v = parseInt(bin, 2) & 0xFFFF;
		return cpu.pad(v.toString(16), 4);
	},

	bin2dec: function (bin) {
		var v = parseInt(bin, 2) & 0xFFFF;
		if (v >= 32768)
			v -= 65536;
		return v;
	},

	dec2bin: function (dec) {
		return cpu.pad((dec & 0xFFFF).toString(2), 16);
	},

	hex2dec: function (hex) {
		var v = parseInt(hex, 16) & 0xFFFF;
		if (v >= 32768)
			v -= 65536;
		return v;
	},

	dec2hex: function (dec) {
		return cpu.pad((dec & 0xFFFF).toString(16), 4);
	},

	updateValues: function () {
		var regNames = Object.keys(cpu.registers);

		function writeValue(val, jqDest) {
			if (jqDest.hasClass("value_binary")) {
				val = cpu.dec2bin(val);
			}
			if (jqDest.hasClass("value_hex")) {
				val = cpu.dec2hex(val);
			}
			jqDest.text(val);
		}

		for (var i = 0; i < regNames.length; i++) {
			var val = cpu.registers[regNames[i]];
			var jqDest = $('#reg_' + regNames[i] + "_val");
			writeValue(val, jqDest);
		}

		for (var i = 0; i < cpu.ram.length; i++) {
			writeValue(cpu.ram[i], $('#ram_value_' + i));
		}
	},



	registers: {
		ac: 0,
		pc: 0,
		mar: 0,
		mbr: 0,
		ir: 0
	},

	updateAnnotations: function () {
		var d = $('#drawing').html("");
		var w = d.width();
		var h = d.height();
		var paper = Raphael("drawing", w, h);
		paper.clear();

		function connect(from, to, attributes, label, labelAttributes) {

			function getX(i, a) {
				switch (a) {
					case 'left':
						return i.position().left;
						break;
					case 'right':
						return i.position().left + i.outerWidth(true);
						break;
					case 'middle':
						return i.position().left + (i.outerWidth(true) / 2);
						break;
					default:
						var percentage = parseInt(a.replace("%", ""));
						return i.position().left + (i.outerWidth(true) * percentage / 100);
						break;
				}
			}

			function getY(i, a) {
				switch (a) {
					case 'top':
						return i.position().top;
						break;
					case 'bottom':
						return i.position().top + i.outerHeight(true);
						break;
					case 'middle':
						return i.position().top + (i.outerHeight(true) / 2);
						break;
					default:
						var percentage = parseInt(a.replace("%", ""));
						return i.position().top + (i.outerHeight(true) * percentage / 100);
				}
			}
			var x1 = getX(from.e, from.h);
			var x2 = x1;
			if (to.h) {
				x2 = getX(to.e, to.h);
			}

			var y1 = getY(from.e, from.v);
			var y2 = y1;
			if (to.v) {
				y2 = getY(to.e, to.v);
			}

			var e = paper.path("M" + Math.floor(x1) + " " + Math.floor(y1) + "L" + Math.floor(x2) + " " + Math.floor(y2));
			if (attributes === undefined) {
				attributes = { "stroke-width": 10, "arrow-end": "block-narrow-short" };
			}
			e.attr(attributes);

			if (label) {
				var x = Math.floor((x1 + x2) / 2);
				var y = Math.floor((y1 + y2) / 2);
				var text = paper.text(x, y, label);
				if (labelAttributes) {
					text.attr(labelAttributes);
				}
			}
		}

		var PC = $('#reg_pc');
		var MAR = $('#reg_mar');
		var decodeUnit = $('.decode_unit');
		var MBR = $('#reg_mbr');
		var IR = $('#reg_ir');
		var ALU = $('#alu');
		var AC = $('#reg_ac');
		var CPU = $('.cpu');
		var RAM = $('.ram');

		connect({ e: ALU, h: "right", h: "2%", v: "middle" }, { e: decodeUnit, h: "right" }, { "stroke-width": 10, "arrow-start": "block-narrow-short" });
		connect({ e: PC, h: "right", v: "middle" }, { e: MAR, h: "left", v: "middle" });
		connect({ e: decodeUnit, h: "60%", v: "top" }, { e: PC, v: "bottom" });
		connect({ e: decodeUnit, h: "80%", v: "top" }, { e: MAR, h: "left", v: "bottom" });
		connect({ e: MBR, h: "middle", v: "bottom" }, { e: IR, h: "middle", v: "top" });
		connect({ e: IR, h: "left", v: "middle" }, { e: decodeUnit, h: "right" });
		connect({ e: MBR, h: "20%", v: "top" }, { e: ALU, v: "bottom" });
		connect({ e: AC, h: "20%", v: "bottom" }, { e: ALU, v: "top" }, { "stroke-width": 10, "arrow-end": "block-narrow-short", "arrow-start": "block-narrow-short" });
		connect({ e: MBR, h: "80%", v: "top" }, { e: AC, h: "80%", v: "bottom" }, { "stroke-width": 10, "arrow-end": "block-narrow-short", "arrow-start": "block-narrow-short" });

		connect({ e: CPU, h: "right", v: "5%" }, { e: RAM, h: "left" }, { "stroke-width": 20, "stroke": "#F00", "arrow-end": "block-narrow-short" }, "Bus direcciones");
		connect({ e: CPU, h: "right", v: "56%" }, { e: RAM, h: "left" }, { "stroke-width": 20, "stroke": "#0000FF", "arrow-end": "block-narrow-short", "arrow-start": "block-narrow-short" }, "Bus datos");
		connect({ e: CPU, h: "right", v: "85%" }, { e: RAM, h: "left" }, { "stroke-width": 20, "stroke": "#808080", "arrow-end": "block-narrow-short", "arrow-start": "block-narrow-short" }, "Bus control");
	},

	init: function (jqCPU) {
		$(window).resize(cpu.updateAnnotations);
		cpu.jqCPU = jqCPU;
		var html = '<div id="drawing"></div><div class="ram"><h3><i class="fa-solid fa-memory"></i>RAM</h3>';
		html += '<table class="table-responsive table-bordered"><thead><tr><th>Dirección</th><th>Valor</th></tr></thead>';
		var params = window.location.search.substr(1);
		var ram = [];
		var initZeros = true;
		if (ram = params.replace("ram=", "")) {
			if (ram = ram.match(/([0-9a-fA-F]{2})/g)) {
				initZeros = false;
			}
		}


		for (var address = 0; address < 16; address++) {
			cpu.ram[address] = initZeros ? 0 : cpu.hex2dec(ram[address]);
			html += '<tr><td id="ram_address_' + address + '" class="value value_denary">' + address + '</td><td id="ram_value_' + address + '" class="value value_denary editable" data-description="Memory address ' + address + '">' + cpu.ram[address] + '</td></tr>';
		}
		html += '</table>';
		html += '</div>';


		html += '<div class="cpu"><h3><i class="fa fa-microchip"></i> CPU</h3>';

		function getRegisterHtml(name, value, desc) {
			return '<div class="register" id="reg_' + name.toLowerCase() + '"><div class="reg_name">' + name + '</div><div id="reg_' + name.toLowerCase() + '_val" class="reg_val value value_denary editable" data-description="' + desc + '">' + value + '</div></div>';
		}
		html += getRegisterHtml('PC', 0, "Program Counter");
		html += getRegisterHtml('MAR', 0, "Memory Address Register");
		html += getRegisterHtml('MBR', 0, "Memory Data Register");
		html += getRegisterHtml('AC', 0, "acumulator");
		html += getRegisterHtml('IR', 0, "Current Instruction Register");

		html += '<div id="alu">ALU</div>';
		html += '<div id="cu">CU</div>';


		html += '<div class="decode_unit"><h4><i class="fa-solid fa-person-chalkboard"></i> Banco de registros</h2>';
		html += '<table class="table-responsive table-bordered"><thead><tr><th>Opcode</th><th>Operando</th><th>Instrucción</th></tr></thead>';
		html += '<tr class="decode_row_0"><td>0000</td><td>0000</td><td>End</td></tr>';
		html += '<tr class="decode_row_1"><td>0001</td><td>address</td><td>Add</td></tr>';
		html += '<tr class="decode_row_2"><td>0010</td><td>address</td><td>Subtract</td></tr>';
		html += '<tr class="decode_row_3"><td>0011</td><td>address</td><td>Store</td></tr>';
		html += '<tr class="decode_row_4"><td>0100</td><td>address</td><td>Mult</td></tr>';
		html += '<tr class="decode_row_5"><td>0101</td><td>address</td><td>Load</td></tr>';
		html += '<tr class="decode_row_6"><td>0110</td><td>address</td><td>Branch Always</td></tr>';
		html += '<tr class="decode_row_7"><td>0111</td><td>address</td><td>Branch if AC = 0</td></tr>';
		html += '<tr class="decode_row_8"><td>1000</td><td>address</td><td>Branch if AC >= 0</td></tr>';
		html += '<tr class="decode_row_9"><td>1001</td><td>0001</td><td>Input</td></tr>';
		html += '<tr class="decode_row_9"><td>1001</td><td>0010</td><td>Output</td></tr>';
		html += '<tr class="decode_row_10"><td>1010</td><td>address</td><td>Div</td></tr>';

		html += '</div>';


		html += '</div>';



		$(jqCPU).html(html);


		cpu.updateAnnotations();

		$('#modal_change_value').modal({ show: false })
		$('#run_speed').change(function () {
			cpu.runDelay = $(this).val();
		});

		$('#btn_reset_cpu').click(function () {
			cpu.state = 0;
			cpu.registers.ac = cpu.registers.ir = cpu.registers.mar = cpu.registers.mbr = cpu.registers.pc = 0;
			cpu.showHint("CPU registers and execution state reset to zero")
			$('.current_instruction').removeClass('current_instruction');
			cpu.updateValues();
		});

		$('#btn_share').click(function () {
			$('#st-2').toggleClass('st-hidden');
		});

		setTimeout(function () {
			$('#st-2').addClass('st-hidden');
		}, 5000);

		$('#btn_reset_ram').click(function () {
			cpu.showHint("All memory store values set to zero");
			for (var address = 0; address < 16; address++) {
				cpu.ram[address] = 0;
				var jq = $('#ram_value_' + address);
				if (jq.hasClass('value_denary')) {
					jq.text(0);
				}
				if (jq.hasClass('value_binary')) {
					jq.text("0000000000000000");
				}
				if (jq.hasClass('value_hex')) {
					jq.text("0000");
				}
			}
		});

		$('.value.editable').click(function (e) {
			var id = e.currentTarget.id;

			var jq = $('#' + id);
			$('#modal_change_value_title').text(jq.data("description"));
			$('#change_value_from').text(jq.text());
			$('#change_value_to').val(jq.text());
			cpu.lastChangedValue = id;
			$('#modal_change_value').modal('show')
		});

		$('#btn_change_value_ok').click(function () {
			function getInt(jq, val) {
				if (jq.hasClass('value_hex')) {
					return cpu.hex2dec(val);
				}
				if (jq.hasClass('value_binary')) {
					return cpu.bin2dec(val);
				}
				val = parseInt(val, 10) & 0xFFFF;
				return val >= 32768 ? val - 65536 : val;
			}

			var jq = $('#' + cpu.lastChangedValue);
			var value = $('#change_value_to').val();
			var parts = cpu.lastChangedValue.split("_");
			switch (parts[0]) {
				case 'ram':
					var address = parseInt(parts[2]);
					cpu.ram[address] = getInt(jq, value);
					break;
				case 'reg':
					var reg = parts[1];
					cpu.registers[reg] = getInt(jq, value);
					break;

			}
			cpu.updateValues();
		});

		$('#btn_step').click(cpu.step);

		$('#btn_run').click(function () {
			if (cpu.running && cpu.nextTimeout) {
				clearTimeout(cpu.nextTimeout);
			} else {
				cpu.running = true;
				cpu.step();
			}
		});

		$('#modal_change_value').on('shown.bs.modal', function () {
			$('#change_value_to').focus().select();
		});

		$('#modal_export').on('shown.bs.modal', function (e) {
			var bytes = [];
			for (var i = 0; i < cpu.ram.length; i++) {
				bytes.push(cpu.dec2hex(cpu.ram[i]));
			}
			var hex = bytes.join(" ");
			$('#export_hex').val(hex).focus().select();
		});

		$('#btn_import').click(function () {
			var bytes = $('#export_hex').val().split(" ");
			for (var i = 0; i < bytes.length && i < cpu.ram.length; i++) {
				cpu.ram[i] = cpu.hex2dec(bytes[i]);
			}
			cpu.updateValues();
		});

		$('#btn_export').click(function () {
			var bytes = $('#export_hex').val().replace(/ /g, "");
			window.location = window.location.origin + window.location.pathname + "?ram=" + bytes;
		});

		$('#btn_toggle_hint').click(function (e) {
			$('#hint').toggleClass('hint-hidden');
		});

		$('.btn_values').click(function (e) {
			var mode = e.currentTarget.id.split("_")[2];
			$('.value').each(function (index, element) {
				var jq = $(this);
				var val = jq.text();
				if (jq.hasClass("value_binary")) {
					val = parseInt(val, 2);
				}
				if (jq.hasClass("value_denary")) {
					val = parseInt(val, 10);
				}
				if (jq.hasClass("value_hex")) {
					val = parseInt(val, 16);
				}
				switch (mode) {
					case 'binary':
						jq.text(cpu.dec2bin(val));
						break
					case 'hex':
						jq.text(cpu.dec2hex(val));
						break;
					case 'denary':
						jq.text(val);
				}
			}).removeClass("value_binary value_denary value_hex").addClass("value_" + mode);

		});

		$('#btn_values_binary').trigger("click");
	}
};
$(function () {
	cpu.init("#cpu")
});