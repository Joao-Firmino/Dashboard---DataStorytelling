import bubbleChart from "../js/Charts/Bubble/bubbleChart.js";
import populateSelectFilters from "../js/Tools/PopulateFunctions/populateSelectFilters.js"
import renderStudentJourneyPoC from "../js/Charts/Trajectory/studentJourneyPoc.js";


let dragged;

const flowTooltipTextById = {
    course_vis: "Mostra quando o aluno acessou a visualizacao geral do curso.",
    resource_vis: "Mostra o acesso aos materiais e recursos da atividade.",
    forum_vis: "Mostra quando o aluno abriu a area do forum.",
    forum_participation: "Mostra interacoes no forum, como respostas e comentarios.",
    assignment_vis: "Mostra o momento em que a atividade foi visualizada.",
    assignment_try: "Mostra tentativas realizadas pelo aluno na atividade.",
    assignment_sub: "Mostra quando a atividade foi enviada pelo aluno."
};

let activeCircle = null;

function positionFlowTooltip(tooltipSelection, targetElement) {
    const gap = 12;
    const viewportMargin = 10;
    const rect = targetElement.getBoundingClientRect();
    const anchorX = rect.left + (rect.width / 2);
    const anchorTopY = rect.top;
    const anchorBottomY = rect.bottom;

    const tooltipNode = tooltipSelection.node();
    if (!tooltipNode) {
        return;
    }

    const tooltipWidth = tooltipNode.offsetWidth;
    const tooltipHeight = tooltipNode.offsetHeight;

    const preferredLeft = anchorX - (tooltipWidth / 2);
    const maxLeft = window.innerWidth - tooltipWidth - viewportMargin;
    const clampedLeft = Math.max(viewportMargin, Math.min(preferredLeft, maxLeft));

    const fitsOnTop = (anchorTopY - gap - tooltipHeight) >= viewportMargin;
    const top = fitsOnTop
        ? anchorTopY - tooltipHeight - gap
        : anchorBottomY + gap;

    const maxArrowOffset = tooltipWidth - 14;
    const arrowOffset = Math.max(14, Math.min(anchorX - clampedLeft, maxArrowOffset));

    tooltipSelection
        .attr("data-placement", fitsOnTop ? "top" : "bottom")
        .style("--arrow-left", `${arrowOffset}px`);

    tooltipSelection
        .style("left", `${clampedLeft + window.scrollX}px`)
        .style("top", `${top + window.scrollY}px`)
        .style("transform", "none");
}

function hideFlowTooltip(tooltipSelection) {
    if (activeCircle) {
        activeCircle.classList.remove("is-tooltip-open");
        activeCircle.setAttribute("aria-pressed", "false");
    }
    tooltipSelection.classed("is-visible", false);
    activeCircle = null;
}

function dragStart(event) {
    dragged = event.target;
}

function initTabs() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabPanels = document.querySelectorAll(".tab-panel");
    let pocRendered = false;

    function activateTab(targetId) {
        tabButtons.forEach((button) => {
            const isActive = button.dataset.tabTarget === targetId;
            button.classList.toggle("is-active", isActive);
        });

        tabPanels.forEach((panel) => {
            panel.classList.toggle("is-active", panel.id === targetId);
        });

        if (targetId === "tab-poc" && !pocRendered) {
            renderStudentJourneyPoC();
            pocRendered = true;
        }
    }

    tabButtons.forEach((button) => {
        button.addEventListener("click", function () {
            activateTab(button.dataset.tabTarget);
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const flowTooltip = d3.select("body")
        .append("div")
        .attr("class", "flow-tooltip")
        .attr("role", "status")
        .attr("aria-live", "polite");

    const circulos = document.querySelectorAll('.circulo');

    circulos.forEach(function (circulo) {
        circulo.draggable = true;
        circulo.setAttribute("aria-pressed", "false");
        circulo.addEventListener('dragstart', dragStart);
        circulo.addEventListener('click', function (event) {
            event.stopPropagation();
            const tooltipText = flowTooltipTextById[circulo.id] || circulo.innerText.trim();

            if (activeCircle === circulo) {
                hideFlowTooltip(flowTooltip);
                return;
            }

            flowTooltip
                .text(tooltipText)
                .classed("is-visible", true);

            if (activeCircle && activeCircle !== circulo) {
                activeCircle.classList.remove("is-tooltip-open");
                activeCircle.setAttribute("aria-pressed", "false");
            }

            circulo.classList.add("is-tooltip-open");
            circulo.setAttribute("aria-pressed", "true");
            positionFlowTooltip(flowTooltip, circulo);
            activeCircle = circulo;
        });
    });

    document.addEventListener('click', function (event) {
        const clickedCircle = event.target.closest('.circulo');
        const clickedTooltip = event.target.closest('.flow-tooltip');
        if (!clickedCircle && !clickedTooltip) {
            hideFlowTooltip(flowTooltip);
        }
    });

    window.addEventListener('resize', function () {
        if (activeCircle) {
            positionFlowTooltip(flowTooltip, activeCircle);
        }
    });

    window.addEventListener('scroll', function () {
        if (activeCircle) {
            positionFlowTooltip(flowTooltip, activeCircle);
        }
    });
});

document.addEventListener('dragover', function (event) {
    event.preventDefault();
});

document.addEventListener('drop', function (event) {
    event.preventDefault();
    const targetCircle = event.target.closest('.circulo');
    if (targetCircle && targetCircle !== dragged) {
        const rect = targetCircle.getBoundingClientRect();
        const offset = event.clientY - rect.top;
        const isAboveCenter = offset < rect.height / 2;

        if (isAboveCenter) {
            targetCircle.before(dragged);
        } else {
            targetCircle.after(dragged);
        }
        // Chamando bubbleChart() após a troca de elementos
        bubbleChart();
    }
});

d3.csv("./data/see_course2060_quiz_list.csv").then(data => {
    populateSelectFilters(data)
});

bubbleChart()

document.addEventListener("DOMContentLoaded", function () {
    var backToTopBtn = document.getElementById("backToTopBtn");

    window.addEventListener("scroll", function () {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            backToTopBtn.parentElement.style.display = "block";
        } else {
            backToTopBtn.parentElement.style.display = "none";
        }
    });

    backToTopBtn.addEventListener("click", function () {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    });

    initTabs();
});