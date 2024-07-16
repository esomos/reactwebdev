import React, { useState, useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'

import "./building_components.css"
import { Link } from "react-router-dom"

const os = getOS()
const platform = (os === 'Android' || os === 'iOS')? 'phone' : 'pc'

export class Container extends React.Component {
    render() {
        return (
            <div style={this.props.style} className='container' >
                {this.props.children}
            </div>
        )
    }
}

export class SubContainer extends React.Component {
    render() {
        return (
            <div className='sub-container' style={this.props.style}>
                {this.props.children}
            </div>
        )
    }
}

export class SmoothAddContainer extends React.Component {
    constructor(props) {
        super(props)
        this.containerRef = React.createRef()
    }

    transition_height() {
        const container = this.containerRef.current
        const newHeight = container.clientHeight
        container.style.height = `${0}px`
        const _ = container.offsetHeight // Trigger a reflow
        container.style.height = `${newHeight}px`
        container.ontransitionend = () => {
            container.style.height = 'auto'
            container.ontransitionend = null
        }
    }

    transition_width(reverse = false) {
        const container = this.containerRef.current
        const newWidth = container.clientWidth
        container.style.width = `${reverse ? newWidth : 0}px`
        const _ = container.offsetWidth // Trigger a reflow
        container.style.width = `${reverse ? 0 : newWidth}px`
        container.ontransitionend = () => {
            if (reverse) {
                container.remove()
            }
            else {
                container.style.width = 'auto'
                container.ontransitionend = null
            }

        }
    }

    componentDidMount() {
        if (platform === 'phone') return
        const container = this.containerRef.current
        if (container) {
            if (this.props.smooth_width) {
                this.transition_width()
            }
            else {
                this.transition_height()
            }
        }
    }

    componentDidUpdate() {
        if (platform === 'phone') return
        const container = this.containerRef.current
        if (container) {
            if (this.props.delete) {
                if (this.props.smooth_width) {
                    this.transition_width(true)
                }
                else {
                    this.transition_height(true)
                }
            }
        }
    }

    render() {
        return (
            <div
                className='smooth-add-container'
                ref={this.containerRef}
                style={this.props.style}
            >
                {this.props.children}
            </div>
        )
    }
}

export class ShrinkContainer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            switch_off: props.switch_off ? true : false,
            sign: props.switch_off ? props.show_sign : props.hide_sign
        }
    }
    render() {
        return (
            // any level of container other than base container must have width 100% in order for overflow to work properly
            <div className="shrink-container">
                <Section>
                    {this.props.disable_button ? null :
                        <Button style={{ width: '100%' }} onClick={(event) => {
                            if (this.state.switch_off) {
                                this.setState({ switch_off: false, sign: this.props.hide_sign })
                            }
                            else {
                                this.setState({ switch_off: true, sign: this.props.show_sign })
                            }
                            if (this.props.onSwitch) {
                                this.props.onSwitch(!this.state.switch_off)
                            }
                        }}> {this.state.sign} </Button>}
                </Section>
                <div
                    style={{
                        ...(this.state.switch_off ? {
                            opacity: 0,
                            position: 'absolute',
                            pointerEvents: 'none'
                        } : null),
                        ...this.props.style,
                    }}
                    className={this.props.className}
                >
                    {this.props.children}
                </div>
            </div>
        )
    }
}

export const SplitContainer = ({ leftComponent, rightComponent, limit }) => {
    const [dividerPosition, setDividerPosition] = useState(50); // Initial position in percentage
    const containerRef = useRef(null);
    const dividerRef = useRef(null)
    const isDragging = useRef(false);

    const startDragging = (e) => {
        isDragging.current = true;
        set_divider_active()
    };

    const stopDragging = (e) => {
        isDragging.current = false;
        set_divider_pasive()
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const newDividerPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        if (newDividerPosition > limit.left && newDividerPosition < (100 - limit.right)) {
            setDividerPosition(newDividerPosition);
        }
    };

    const set_divider_active = () => {
        dividerRef.current.style.backgroundColor = '#999'
        containerRef.current.style.cursor = 'col-resize'
    }
    const set_divider_pasive = () => {
        dividerRef.current.style.backgroundColor = '#cccccc00'
        containerRef.current.style.cursor = 'unset'
    }

    return (
        <div
            className="split-container"
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
        >
            <div className="left-pane" style={{ width: `${dividerPosition}%` }}>
                {leftComponent}
            </div>
            <div
                ref={dividerRef}
                className="divider"
                onMouseDown={startDragging}
                onMouseEnter={set_divider_active}
                onMouseLeave={() => { if (!isDragging.current) set_divider_pasive() }}
                style={{ left: `${dividerPosition}%` }}
            />
            <div className="right-pane" style={{ width: `${100 - dividerPosition}%` }}>
                {rightComponent}
            </div>
        </div>
    );
}

export class Section extends React.Component {
    render() {
        return (
            <div className='section' id={this.props.id} ref={this.props.passRef} style={this.props.style}>
                {this.props.children}
            </div>
        )
    }
}

export class SubSection extends React.Component {
    render() {
        return (
            <div className='sub-section' style={this.props.style} ref={this.props.passRef}>
                {this.props.children}
            </div>
        )
    }
}

export class LabeledSection extends React.Component {
    render() {
        return (
            <SubSection>
                {(!this.props.label) ? null : <span style={{ margin: "5px" }}>{this.props.label}:</span>}
                {this.props.children}
            </SubSection>
        )
    }
}

export class Input extends React.Component {
    render() {
        return (
            <LabeledSection label={this.props.label}>
                <input
                    type={this.props.type}
                    value={this.props.value}
                    onChange={this.props.onChange ? this.props.onChange : null}
                    style={this.style}
                />
            </LabeledSection>
        )
    }
}

export class InputText extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            changed: false
        }
        this.session_value = this.props.value
    }
    componentDidUpdate(prev_props) {
        if (prev_props.value !== this.props.value) { // if change in value
            this.setState({ changed: this.props.value !== this.session_value })
            console.log('helo')
        }
    }
    render() {
        return (
            <LabeledSection label={this.props.label}>
                <input
                    className={this.state.changed ? 'input-changed' : null}
                    style={{
                        width: this.props.value.length * 10 + 20,
                        ...this.style
                    }}
                    type='text'
                    value={this.props.value}
                    onChange={(event) => {
                        this.setState({ changed: true })
                        this.props.onChange(event)
                    }}
                />
            </LabeledSection>
        )
    }
}

export class InputColor extends React.Component {
    render() {
        return (
            <LabeledSection>
                <input
                    type='color'
                    value={this.props.value}
                    style={this.style}
                    onChange={this.props.onChange}
                />
            </LabeledSection>
        )
    }
}

export class InputNumber extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            changed: false
        }
        this.session_value = props.value
    }

    componentDidUpdate(prev_props) {
        if (prev_props.value !== this.props.value) { // if change in value
            this.setState({ changed: this.props.value !== this.session_value })
        }
    }

    render() {
        return (
            <LabeledSection label={this.props.label}>
                <div style={{ display: 'flex', columnGap: '4px' }}>
                    <Button onClick={() => {
                        const input_value = this.props.value
                        this.props.onChange({ target: { value: input_value - 1 } })
                    }}>-</Button>
                    <input
                        className={this.state.changed ? 'input-changed' : null}
                        onChange={(event) => {
                            this.props.onChange(event)
                        }}
                        style={
                            {
                                borderRadius: '0px',
                                width: String(this.props.value).length * 15 + 20,
                                ...this.style
                            }
                        }
                        type='number'
                        value={this.props.value ? this.props.value : 0}
                    />
                    <Button onClick={() => {
                        const input_value = this.props.value
                        this.props.onChange({ target: { value: input_value + 1 } })
                    }}>+</Button>
                </div>
            </LabeledSection>
        )
    }
}

export class Button extends React.Component {
    render() {
        return (
            <div
                className={(platform === "pc") ? "button pc-button" : "button phone-button"}
                ref={this.props.sef}
                onClick={this.props.onClick}
                onMouseDown={this.props.onMouseDown}
                onMouseUp={this.props.onMouseUp}
                onMouseMove={this.props.onMouseMove}
                style={this.props.style}
                tooltip={this.props.tooltip}
            >
                {this.props.children}
            </div>
        )
    }
}

export class RearrangeButton extends React.Component {
    render(){
        return (
            <>
                <Button onClick={() => this.props.onRearrange(-1)}>
                    ↑
                </Button>
                <Button onClick={() => this.props.onRearrange(1)}>
                    ↓
                </Button>
            </>
        )
    }
}

export class ButtonLink extends React.Component {
    render() {
        return (
            <Button parent={this.props.parent}>
                <Link to={this.props.to}>
                    {this.props.children}
                </Link>
            </Button>
        )
    }
}

export class HistoGraph extends React.Component {
    static Bar = (props) => {
        const PLOTS = props.bar.plots
        return (
            /* this div stores plots, name and height number of bar */
            <SmoothAddContainer key={props.key} smooth_width={true}>
                <div className='histo-bar'>
                    <span>{props.bar.height}</span>
                    {/* this div stores plots of bar*/}
                    <div className='histo-bar-plots' style={{ backgroundColor: props.bar.color }}>
                        {PLOTS.map((val, i) => {
                            return <div key={i} className='histo-bar-plot' style={{
                                backgroundColor: val.color,
                                height: `${val.percentage}%`,
                            }}>
                                <span>{val.percentage}%</span>
                                <span>{val.name}</span>
                            </div>
                        })}
                    </div>
                    <span>{props.bar.name}</span>
                </div>
            </SmoothAddContainer>
        )
    }
    render() {
        return (
            <SubContainer>
                <ShrinkContainer
                    show_sign="Show Graph"
                    hide_sign="Hide Graph"
                    className="histo-graph"
                    disable_button={this.props.disable_button}
                >
                    {
                        !this.props.graph.length ? 'nothing to show!' :
                            this.props.graph.map((val, i) => (
                                HistoGraph.Bar({ key: val.key, bar: val })
                            ))
                    }
                </ShrinkContainer>
            </SubContainer>
        )
    }
}

export const DraggableItem = ({ index, children, className, drop_hover, onDrop, item_key, item_type, drag_ref }) => {
    const ref = useRef(null)
    const [{ isDragging }, drag, preview] = useDrag({
        type: item_type ? item_type : 'ITEM',
        item: { index, item_key },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        })
    })

    const [, drop] = useDrop({
        accept: item_type ? item_type : 'ITEM',
        hover: drop_hover,
        drop: onDrop
    })

    drag(drag_ref ? drag_ref : ref)
    drop(ref)
    preview(ref)
    return (
        <div className={className} ref={ref} style={{ opacity: isDragging ? 0 : 1 }}>
            {children}
        </div>
    )
}

class LogSubject extends React.Component {
    render() {
        return (
            <SmoothAddContainer delete={false}>
                <Section>
                    <SubSection>
                        <InputText
                            value={this.props.subject.name}
                            onChange={(event) => {
                                this.props.onChange({
                                    name: event.target.value,
                                    index: this.props.index
                                })
                            }}
                        />

                        <InputColor
                            value={this.props.subject.color}
                            onChange={(event) => {
                                this.props.onChange({
                                    color: event.target.value,
                                    index: this.props.index
                                })
                            }} />

                    </SubSection>
                    <SubSection>
                        <InputNumber
                            label='present'
                            value={this.props.subject.present}
                            sef={this.present_field_ref}
                            onChange={(event) => this.props.onChange({
                                present: Number(event.target.value),
                                index: this.props.index
                            })}
                        />
                        <InputNumber
                            label='from total'
                            value={this.props.subject.total}
                            sef={this.total_field_ref}
                            onChange={(event) => this.props.onChange({
                                total: Number(event.target.value),
                                index: this.props.index
                            })}
                        />
                    </SubSection>
                    <SubSection>
                        <Button onClick={() => {
                            this.props.onChange({
                                present: this.props.subject.present - 1,
                                total: this.props.subject.total - 1,
                                index: this.props.index
                            })
                        }}>-</Button>
                        <Button onClick={() => {
                            this.props.onChange({
                                present: this.props.subject.present + 1,
                                total: this.props.subject.total + 1,
                                index: this.props.index
                            })
                        }}>+</Button>
                    </SubSection>
                    {(platform === 'pc') ? null :
                    <SubSection>
                        <RearrangeButton onRearrange={this.props.onRearrange} />
                    </SubSection>}
                    <SubSection>
                        {(platform === 'phone') ? null :
                        <Button sef={this.props.drag_button_ref} style={{ cursor: 'grab' }}>
                            🖐🏻
                        </Button>}
                        <Button
                            tooltip="booho"
                            onClick={() => { this.props.onCross(this.props.index) }}
                        >
                            ✖
                        </Button>
                    </SubSection>
                </Section>
            </SmoothAddContainer>
        )
    }
}

const subject_refs = {}
export class AttendanceLog extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            log: props.log,
            key: 0
        }
    }

    key_gen() {
        const log = this.state.log
        return log.key_count++
    }

    handle_subject_change(event) {
        const subject = this.state.log.subjects[event.index]
        const bar = this.state.log.graph[event.index]

        if (event.total !== undefined) {
            subject.total = event.total
            bar.height = event.total
            bar.plots[0].percentage = Math.round((subject.present / event.total) * 100)
        }
        if (event.present !== undefined) {
            subject.present = event.present
            bar.plots[0].percentage = Math.round((event.present / subject.total) * 100)
        }
        if (event.name !== undefined) {
            subject.name = event.name
            bar.name = (event.name === '') ? '(nameless)' : event.name
        }
        if (event.color) {
            subject.color = event.color
            bar.plots[0].color = event.color
        }
        this.setState({ log: this.state.log })
    }
    handle_subject_cross(index) {
        this.state.log.subjects.splice(index, 1)
        this.state.log.graph.splice(index, 1)
        this.setState({ log: this.state.log })
    }

    handle_log_change(event) {
        const log = this.state.log
        log.name = event.target.value
        this.setState({ log: log })
    }

    render_subjects(log, disable_button, style) {
        const add_subject = (p_at) => {
            const random_color = getRandomColorWithSV(0.8, 0.9)
            const new_key = this.key_gen()
            const new_subject = {
                name: 'name',
                present: 50,
                total: 100,
                color: random_color,
                key: new_key,
            }
            const new_bar = {
                name: 'name',
                color: 'rgb(0, 0, 0, 0.2)',
                height: 100,
                plots: [
                    {
                        name: '',
                        color: random_color,
                        percentage: 50
                    }
                ],
                key: new_key
            }
            if (p_at) {
                log.subjects.splice(p_at, 0, new_subject)
                log.graph.splice(p_at, 0, new_bar)
            }
            else {
                log.subjects.unshift(new_subject)
                log.graph.unshift(new_bar)
            }
            this.setState({ log: log })
        }
        return (
            <SubContainer>
                <ShrinkContainer
                    show_sign="Show Subjects"
                    hide_sign="Hide Subjects"
                    className="log-subject-container"
                    style={style}
                    disable_button={disable_button ? disable_button : undefined}
                >
                    <Section>
                        <Button style={{ width: '100%' }} onClick={() => add_subject(0)}>+</Button>
                    </Section>
                    {!log.subjects.length ? 'add a subject!' :
                        log.subjects.map((value, i) => {
                            const subject_ref = subject_refs[value.key] ? subject_refs[value.key] : React.createRef()
                            subject_refs[value.key] = subject_ref
                            return (
                                <DraggableItem
                                    className='log-subject-sub-container'
                                    key={value.key}
                                    index={i}
                                    drag_ref={subject_ref}
                                    item_type="SUBJECT"
                                    item_key={value.key}
                                    drop_hover={(item) => {
                                        if (item.item_key !== value.key) {
                                            array_shift_entry(log.subjects, item.index, i)
                                            array_shift_entry(log.graph, item.index, i)
                                            item.index = i
                                            this.setState({ log: log })
                                        }
                                    }}
                                >
                                    <LogSubject
                                        subject={value}
                                        drag_button_ref={subject_ref}
                                        index={i}
                                        is_last={i === log.subjects.length - 1}
                                        onRearrange={(direction) => {
                                            array_shift_entry(log.subjects, i, i + direction)
                                            array_shift_entry(log.graph, i, i + direction)
                                            this.setState({ log: log })
                                        }}
                                        onChange={this.handle_subject_change.bind(this)}
                                        onCross={this.handle_subject_cross.bind(this)}
                                    />
                                    <div
                                        className='log-add-new-subject-button'
                                        onClick={() => add_subject(i + 1)}
                                    >
                                    </div>
                                </DraggableItem>
                            )
                        })
                    }

                </ShrinkContainer>
            </SubContainer>
        )
    }
    render() {
        const log = this.state.log
        return (
            <Container style={{ rowGap: '10px' }} key={this.state.key}>
                <SubContainer style={{ fontSize: 'large' }}>
                    <Section>
                        <InputText value={log.name} onChange={this.handle_log_change.bind(this)} />
                        <SubSection>
                            <RearrangeButton onRearrange={this.props.onRearrange} />
                        </SubSection>
                        <SubSection>
                            <Button onClick={() => {
                                console.log(log)
                                this.props.onSave(this.props.index,  this.state.log)
                                this.setState({ key: this.state.key + 1 })
                            }}>Save 💼</Button>
                            <Button onClick={() => this.props.onCross(this.props.index)}>✖</Button>
                        </SubSection>
                    </Section>
                </SubContainer>
                <ShrinkContainer
                    hide_sign="Hide Details ↑"
                    show_sign="Show Details ↓"
                    switch_off={!log.show_details}
                    onSwitch={(switch_condition) => log.show_details = !switch_condition}
                    className="log-subject-and-graph-container">
                    {this.props.flex_row ?
                        <SplitContainer
                            leftComponent={this.render_subjects(log, true, { height: 500, overflow: 'auto' })}
                            rightComponent={<HistoGraph disable_button="true" graph={log.graph} />}
                            limit={{ left: 30, right: 10 }}
                        /> :
                        <div style={{ display: 'flex', rowGap: '10px', flexDirection: 'column', width: '100%' }}>
                            {this.render_subjects(log, false, { height: '100%' })}
                            <HistoGraph graph={log.graph} />
                        </div>
                    }
                </ShrinkContainer>
            </Container>
        )
    }
}

// helper methods

function get_element_pos(element, ancker) {
    const rect = element.getBoundingClientRect()
    switch (ancker) {
        case "top":
            return {
                x: rect.x + window.scrollX + rect.width / 2.0,
                y: rect.y + window.scrollY
            }
        case "left":
            return {
                x: rect.x + window.scrollX,
                y: rect.y + window.scrollY + rect.height / 2.0
            }
        case "right":
            return {
                x: rect.x + window.scrollX + rect.width,
                y: rect.y + window.scrollY + rect.height / 2.0
            }
        case "bottom":
            return {
                x: rect.x + window.scrollX + rect.width / 2.0,
                y: rect.y + window.scrollY + rect.height
            }
        default:
            return {
                x: rect.x + window.scrollX,
                y: rect.y + window.scrollY
            }
    }
}
function deepCopy(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(deepCopy);
    }

    let copy = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            copy[key] = deepCopy(obj[key]);
        }
    }
    return copy;
}

// Function to convert HSV to RGB
function hsvToRgb(h, s, v) {
    let r, g, b

    const i = Math.floor(h / 60)
    const f = h / 60 - i
    const p = v * (1 - s)
    const q = v * (1 - f * s)
    const t = v * (1 - (1 - f) * s)

    switch (i % 6) {
        case 0:
            r = v; g = t; b = p
            break
        case 1:
            r = q; g = v; b = p
            break
        case 2:
            r = p; g = v; b = t
            break
        case 3:
            r = p; g = q; b = v
            break
        case 4:
            r = t; g = p; b = v
            break
        case 5:
            r = v; g = p; b = q
            break
        default:
            break
    }

    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
}

// Function to convert RGB to Hex
function rgbToHex(r, g, b) {
    const toHex = n => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Function to generate a random color with given saturation and value
function getRandomColorWithSV(saturation, value) {
    const randomHue = Math.floor(Math.random() * 360);
    const [r, g, b] = hsvToRgb(randomHue, saturation, value);
    return rgbToHex(r, g, b);
}

export function array_shift_entry(arr, from, to) {
    const temp = arr[from]
    arr.splice(from, 1)
    arr.splice(to, 0, temp)
}

function getOS() {
    let userAgent = window.navigator.userAgent;
    let platform = window.navigator?.userAgentData?.platform || window.navigator.platform;
    let macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
    let windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
    let iosPlatforms = ['iPhone', 'iPad', 'iPod'];
    let os = null;

    if (macosPlatforms.includes(platform)) {
        os = 'Mac OS';
    } else if (iosPlatforms.includes(platform)) {
        os = 'iOS';
    } else if (windowsPlatforms.includes(platform)) {
        os = 'Windows';
    } else if (/Android/.test(userAgent)) {
        os = 'Android';
    } else if (/Linux/.test(platform)) {
        os = 'Linux';
    }

    return os;
}
